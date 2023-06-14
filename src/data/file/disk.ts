import {FileData} from "./types";
import {writeFile, mkdir} from "fs/promises";
import {dirname, join} from "node:path";
import {getRemoteSourceKey, getRemoteSourcePrefix} from "./source";

export async function saveToDisk(file: Pick<FileData, "fileName" | "contentType"> & Partial<Pick<FileData, "source">>, contents: Buffer | Blob): Promise<Partial<FileData>> {
    const path = getRemoteSourceKey(file.source, "store") ?? ".cache/.store";
    let prefix = getRemoteSourcePrefix(file.source) ?? "";
    if (prefix && !prefix.endsWith("/")) {
        prefix = `${prefix}/`;
    }
    const key = `${prefix}${file.fileName}`
    let fullPath = join(path, key);
    if (!fullPath.startsWith("/")) {
        fullPath = join(process.cwd(), fullPath);
    }
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