import {DEFAULT_BRANDING_LOGO, getConfig, PUBLIC_PATH, BRANDING_LOGO, BRANDING_LOGO_REDIRECT} from "../config";
import {root} from "../package";
import {basename, join} from "node:path";
import {stat} from "fs/promises";
import {ok} from "../is";
import {ROOT_PUBLIC_PATH} from "../view";
import {readFile} from "node:fs/promises";
import mime from "mime";
import {File, FileData, getNamedFileStore, getSignedUrl, setFile} from "../data";
import {save} from "../data/file/save";

const BRANDING_FILE_KEY = "branding";
const BRANDING_LOGO_KEY = "logo";

function getBrandingFileStore() {
    return getNamedFileStore(BRANDING_FILE_KEY);
}

interface LogoFile extends File {
    logo?: unknown;
}

async function getLogoFile(logo: string): Promise<LogoFile> {
    const store = getBrandingFileStore();
    const existing = await store.get(BRANDING_LOGO_KEY);
    if (existing) {
        return existing;
    }
    return setFile({
        fileName: basename(logo),
        fileId: BRANDING_LOGO_KEY,
        type: BRANDING_FILE_KEY
    }, store);
}

function getPublicRoots() {
    const roots = [
        ROOT_PUBLIC_PATH,
    ];
    const config = getConfig();
    if (root !== config.root && config.root) {
        roots.unshift(
            join(config.root, PUBLIC_PATH || "public")
        );
    }
    return roots;
}

export async function deleteBrandingLogoFile() {
    const store = getBrandingFileStore();
    // TODO delete file behind the scenes too
    await store.delete(BRANDING_FILE_KEY);
}

export async function getBrandingLogoBufferAndType() {
    const logo = await getBrandingLogo();
    // If we don't have a buffer it's because we expected a redirect to be used
    // where a buffer isn't needed. But if a buffer is wanted, it can happen using a fetch.
    if (logo.buffer) {
        return logo;
    }
    ok(isFetchHTTP(logo.url), "Expected http or https if no buffer for logo");
    return fetchHTTPBufferAndType(logo.url);
}

export async function getBrandingLogo() {
    const logo = await getBrandingLogoLocation();

    if (!isFetchHTTP(logo)) {
        return getFileBufferAndType(logo);
    }

    if (BRANDING_LOGO_REDIRECT) {
        return {
            url: logo,
            buffer: undefined,
            contentType: undefined
        }
    }

    const existing = await getLogoFile(logo);

    if (existing.logo === logo && existing.url) {
        return {
            url: existing.signed ? existing.url : await getSignedUrl({
                url: existing.url
            }),
            buffer: undefined,
            contentType: existing.contentType
        }
    }

    const { buffer, contentType, url } = await fetchHTTPBufferAndType(logo);
    await save({
        ...existing,
        contentType,
        logo
    }, buffer, getBrandingFileStore());
    return { buffer, contentType, url };
}


async function fetchHTTPBufferAndType(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("Content-Type") || mime.getType(url);
    return {
        url,
        buffer,
        contentType
    }
}

async function getFileBufferAndType(path: string) {
    const buffer = await readFile(path);
    // Could use blob here, but then we need to go from blob to buffer elsewhere
    return {
        url: `file://${path}`,
        buffer,
        contentType: mime.getType(path)
    }
}

function isFetchHTTP(name?: string) {
    if (!name) return false;
    const { protocol } = new URL(name, "file://");
    return protocol === "http:" || protocol === "https:";
}

export async function getBrandingLogoLocation() {

    const roots = getPublicRoots();

    if (BRANDING_LOGO) {
        return getBrandingLogo(BRANDING_LOGO);
    }
    return getPublicLogo();

    async function getBrandingLogo(logo: string) {
        if (isFetchHTTP(logo)) {
            return logo;
        }
        const found = await getFirstFile(roots, [
            logo
        ]);
        ok(found, "Expected BRANDING_LOGO at PUBLIC_PATH");
        return found;
    }

    async function getPublicLogo() {
        if (isFetchHTTP(DEFAULT_BRANDING_LOGO)) {
            return DEFAULT_BRANDING_LOGO;
        }
        const found = await getFirstFile(roots, [
            DEFAULT_BRANDING_LOGO,
            "logo.svg",
            "logo.png"
        ]);
        ok(found, "Expected to find logo at root or BRANDING_LOGO");
        return found;
    }

    async function getFirstFile(paths: string[], names: string[]) {
        for (const root of paths) {
            if (!root) continue;
            for (const name of names) {
                if (!name) continue;
                const path = join(root, name);
                if (await isFile(path)) {
                    return path;
                }
            }
        }
        return undefined;
    }

}

async function isFile(path: string) {
    try {
        const fileStat = await stat(path);
        return fileStat.isFile();
    } catch {
        return false;
    }
}