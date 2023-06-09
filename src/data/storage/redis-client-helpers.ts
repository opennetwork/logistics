import {KeyValueStoreOptions} from "./types";
import { } from "./redis-client-helpers";


export function isNumberString(value?: unknown): value is `${number}` | number {
  return (
      (typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value)) ||
      typeof value === "number"
  );
}

export function isRedis() {
  return !!getRedisUrl();
}

export function getRedisUrl() {
  return process.env.REDIS_URL;
}

export function getRedisPrefix(name: string, options?: KeyValueStoreOptions) {
  return `${name}::${options?.prefix ?? ""}`;
}

export function getRedisPrefixedKey(name: string, key: string, options?: KeyValueStoreOptions): string {
  return `${getRedisPrefix(name, options)}${key}`;
}