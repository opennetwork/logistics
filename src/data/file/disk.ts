import {FileData} from "./types";
import {writeFile, mkdir, stat, readFile, unlink} from "fs/promises";
import {dirname, join} from "node:path";
import {getRemoteSourceKey, getRemoteSourcePrefix} from "./source";

function getFullPath(file: FileData) {
    const path = getRemoteSourceKey(file.source, "store") ?? ".cache/.store";
    let prefix = file.source ? getRemoteSourcePrefix(file.source) : "";
    if (prefix && !prefix.endsWith("/")) {
        prefix = `${prefix}/`;
    }
    const key = `${prefix}${file.fileName}`
    let fullPath = join(path, key);
    if (!fullPath.startsWith("/")) {
        fullPath = join(process.cwd(), fullPath);
    }
    return fullPath;
}

export async function saveToDisk(file: FileData, contents: Buffer | Blob): Promise<Partial<FileData>> {
    const fullPath = getFullPath(file);
    const pathDirectory = dirname(fullPath);
    await mkdir(pathDirectory, {
        recursive: true
    });
    const buffer = Buffer.isBuffer(contents) ?
        contents :
        Buffer.from(await contents.arrayBuffer());
    await writeFile(
        fullPath,
        buffer
    );
    return {
        synced: "disk",
        syncedAt: new Date().toISOString(),
        url: `file://${fullPath}`
    };
}

async function isPathOnDisk(path: string) {
    try {
        const pathStat = await stat(path);
        return pathStat.isFile();
    } catch {
        return false
    }
}

export async function readFileFromDisk(file: FileData): Promise<Buffer | undefined> {
    const fullPath = getFullPath(file);
    const isOnDisk = await isPathOnDisk(fullPath);
    if (!isOnDisk) {
        return undefined;
    }
    return await readFile(fullPath);
}

export async function unlinkFromDisk(file: FileData) {
    const fullPath = getFullPath(file);
    const isOnDisk = await isPathOnDisk(fullPath);
    if (!isOnDisk) {
        return;
    }
    await unlink(fullPath);
}