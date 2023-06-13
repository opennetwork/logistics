export type SourceEnvName = "store" | "name";
const SOURCE_ENV_KEY: Record<SourceEnvName, string> = {
    store: "OFFLINE_STORE",
    name: "COMMUNITY_NAME"
}

export function getSourceKey(source: string | undefined, key: "store" | "name") {
    if (!source) return undefined;
    const envKey = `${source}_MEDIA_${SOURCE_ENV_KEY[key]}`.toUpperCase();
    return process.env[envKey];
}