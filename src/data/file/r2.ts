import {HeadObjectCommand, PutObjectCommand, S3Client, S3ClientConfig} from "@aws-sdk/client-s3";
import {ok} from "../../is";
import {FileData} from "./types";
import {getRemoteSourcePrefix} from "./source";
import {createHash} from "crypto";

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

const { DISABLE_EXISTING_FILE } = process.env;

const ENABLE_EXISTING_FILE = !DISABLE_EXISTING_FILE;

export async function isExistingInR2(file: FileData) {
    // Disable any functionality trying to use existing
    if (!ENABLE_EXISTING_FILE) return false;
    const client = await getR2();
    let prefix = getRemoteSourcePrefix(file.source) ?? "";
    if (prefix && !prefix.endsWith("/")) {
        prefix = `${prefix}/`;
    }
    const key = `${prefix}${file.fileName}`
    const headCommand = new HeadObjectCommand({
        Key: key,
        Bucket: R2_BUCKET,
    });
    try {
        await client.send(headCommand);
        return true;
    } catch {
        return false;
    }
}

export async function saveToR2(file: FileData, contents: Buffer | Blob): Promise<Partial<FileData>> {
    const client = await getR2()
    let prefix = getRemoteSourcePrefix(file.source) ?? "";
    if (prefix && !prefix.endsWith("/")) {
        prefix = `${prefix}/`;
    }
    const key = `${prefix}${file.fileName}`

    const buffer = Buffer.isBuffer(contents) ?
        contents :
        Buffer.from(await contents.arrayBuffer());

    const hash256 = createHash("sha256");
    hash256.update(buffer);
    const hash5 = createHash("md5");
    hash5.update(buffer);
    const checksum = {
        SHA256: hash256.digest().toString("base64"),
        MD5: hash5.digest().toString("base64")
    };

    const url = new URL(
        `/${key}`,
        R2_ENDPOINT
    ).toString();

    if (await isExistingInR2(file)) {
        // console.log(`Using existing uploaded file for ${file.fileName}`);
        return {
            synced: "r2",
            syncedAt: file.syncedAt || new Date().toISOString(),
            url,
            // Allow checksum to be updated if it wasn't present!
            checksum: {
                ...checksum,
                ...file.checksum
            }
        }
    }

    // console.log(`Uploading file ${file.fileName} to R2`, checksum);

    const command = new PutObjectCommand({
        Key: key,
        Bucket: R2_BUCKET,
        Body: buffer,
        ContentType: file.contentType,
        ContentMD5: checksum.MD5
    });

    const result = await client.send(command);
    return {
        synced: "r2",
        syncedAt: new Date().toISOString(),
        url,
        checksum: {
            ...checksum,
            ...getChecksum(result)
        }
    };
}

function getChecksum(result: { ChecksumCRC32?: string, ChecksumCRC32C?: string, ChecksumSHA1?: string, ChecksumSHA256?: string }) {
    if (!result.ChecksumSHA256) return undefined;
    return {
        CRC32: result.ChecksumCRC32,
        CRC32C: result.ChecksumCRC32C,
        SHA1: result.ChecksumSHA1,
        SHA256: result.ChecksumSHA256
    }
}