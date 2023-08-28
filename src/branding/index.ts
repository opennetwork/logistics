import {DEFAULT_BRANDING_LOGO, getConfig, PUBLIC_PATH, BRANDING_LOGO} from "../config";
import {root} from "../package";
import {join} from "node:path";
import {stat} from "fs/promises";
import {ok} from "../is";
import {ROOT_PUBLIC_PATH} from "../view";
import {readFile} from "node:fs/promises";
import mime from "mime";


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

export async function getBrandingLogoBufferAndType() {
    const logo = await getBrandingLogoFile();
    const buffer = await readFile(logo.path);
    // Could use blob here, but then we need to go from blob to buffer elsewhere
    return {
        buffer,
        type: mime.getType(logo.path)
    }
}

export async function getBrandingLogoFile() {

    const roots = getPublicRoots();

    if (BRANDING_LOGO) {
        return getBrandingLogo(BRANDING_LOGO);
    }
    return getPublicLogo();

    async function getBrandingLogo(logo: string) {
        const found = await getFirstFile(roots, [
            logo
        ]);
        ok(found, "Expected BRANDING_LOGO at PUBLIC_PATH");
        return found;
    }

    async function getPublicLogo() {
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
                    return {
                        root,
                        path,
                        name,
                    };
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