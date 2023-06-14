import {PutObjectCommand, S3Client, S3ClientConfig} from "@aws-sdk/client-s3";
import {ok} from "../../is";
import {FileData} from "./types";
import {getRemoteSourcePrefix} from "./source";

export const {
    R2_ACCESS_KEY_ID,
    R2_ACCESS_KEY_SECRET,
    R2_BUCKET,
    R2_ENDPOINT
} = process.env

export const r2Config: S3ClientConfig = {
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_ACCESS_KEY_SECRET,
    },
    endpoint: R2_ENDPOINT,
    region: "auto"
}

let r2Client: S3Client | undefined = undefined;

export async function getR2() {
    if (r2Client) return r2Client;
    ok(isR2(), "Expected R2 to be configured");
    const { S3Client } = await import("@aws-sdk/client-s3");
    r2Client = new S3Client(r2Config);
    return r2Client;
}

export function isR2() {
    return (
        R2_ACCESS_KEY_ID &&
        R2_ACCESS_KEY_SECRET &&
        R2_BUCKET &&
        R2_ENDPOINT
    )
}

export async function saveToR2(file: Pick<FileData, "fileName" | "contentType"> & Partial<Pick<FileData, "source">>, contents: Buffer | Blob): Promise<Partial<FileData>> {
    const client = await getR2();
    let prefix = getRemoteSourcePrefix(file.source) ?? "";
    if (prefix && !prefix.endsWith("/")) {
        prefix = `${prefix}/`;
    }
    const key = `${prefix}${file.fileName}`
    const buffer = Buffer.isBuffer(contents) ?
        contents :
        Buffer.from(await contents.arrayBuffer());
    const command = new PutObjectCommand({
        Key: key,
        Bucket: R2_BUCKET,
        Body: buffer,
        ContentType: file.contentType,
    });
    await client.send(command);
    return {
        synced: "r2",
        syncedAt: new Date().toISOString(),
        url: new URL(
            `/${key}`,
            R2_ENDPOINT
        ).toString()
    }
}