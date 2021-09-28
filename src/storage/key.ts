import {getEnvironmentConfig, getTypedStore, Store, TypedStore} from "@opennetwork/environment";

const BrandedStoreKeySymbol = Symbol("BrandedStoreKey")
export type BrandedStoreKey<K extends StoreKey, T> = K & {
    [BrandedStoreKeySymbol]: T
}

export type StoreKey = string | URL;

export const LogisticsStorageKeyPrefix = "https://logistics.opennetwork.dev/#prefix";
export const LogisticsUserStorageKeyPrefix = "https://logistics.opennetwork.dev/#userPrefix";
export const LogisticsItemStorageKeyPrefix = "https://logistics.opennetwork.dev/#itemPrefix";
export const LogisticsUnknownStorageKeyPrefix = "https://logistics.opennetwork.dev/#unknownPrefix";
export const LogisticsStorageKeyPrefixDefault = "https://logistics.opennetwork.dev/";
export const LogisticsUnknownStorageKeyPrefixDefault = "unknown/";

declare global {

    interface EnvironmentConfig extends Record<string, unknown> {
        [LogisticsStorageKeyPrefix]?: string;
        [LogisticsUserStorageKeyPrefix]?: string;
        [LogisticsItemStorageKeyPrefix]?: string;
        [LogisticsUnknownStorageKeyPrefix]?: string;
    }

}

function getLogisticsStorageKeyPrefixFromConfig(key = LogisticsStorageKeyPrefix, defaultValue: string = LogisticsStorageKeyPrefixDefault) {
    const config: Record<string, unknown> = getEnvironmentConfig();
    const value = config[key];
    return typeof value === "string" ? value : defaultValue;
}

export function getLogisticsStorageKeyPrefix(key = LogisticsUnknownStorageKeyPrefix, defaultValue: string = LogisticsUnknownStorageKeyPrefixDefault) {
    const prefixPrefix = getLogisticsStorageKeyPrefixFromConfig(LogisticsStorageKeyPrefix, LogisticsStorageKeyPrefixDefault);
    const prefix = getLogisticsStorageKeyPrefixFromConfig(key, defaultValue);
    return `${prefixPrefix}${prefix}`
}

export function isLogisticsStoreKey(value: unknown, prefix = getLogisticsStorageKeyPrefixFromConfig()): boolean {
    if (!value) return false;
    if (typeof value === "string") {
        return value.startsWith(prefix);
    }
    return isLogisticsStoreKey(String(value), prefix);
}

function brandKey<K extends BrandedStoreKey<StoreKey, unknown>>(key: unknown): asserts key is K {
    if (!isLogisticsStoreKey(key)) {
        throw new Error("Expected key to match configured prefix");
    }
}

export function getLogisticsStoreKey<I extends symbol, K extends BrandedStoreKey<StoreKey, I>, Z extends StoreKey & Uint8Array>(key: Z, prefix?: string): BrandedStoreKey<StoreKey, I> & Z
export function getLogisticsStoreKey<I extends symbol, K extends BrandedStoreKey<StoreKey, I>, Z extends StoreKey & string>(key: Z, prefix?: string): BrandedStoreKey<StoreKey, I> & `${string}${Z & string}`
export function getLogisticsStoreKey<I extends symbol, K extends BrandedStoreKey<StoreKey, I>, Z extends StoreKey>(key: Z, prefix = getLogisticsStorageKeyPrefixFromConfig()): BrandedStoreKey<StoreKey, I> & `${string}${Z & string}` | Z {
    // non strings we can assume are fully resolved.
    const output: `${string}${Z & string}` | Z = typeof key !== 'string' ? key : `${prefix}${key}`
    brandKey<K>(output);
    return output;
}

export interface StoreInformation<V extends object, S extends symbol> {
    prefix: string;
    store: TypedStore<Store<BrandedStoreKey<StoreKey, S>, V>>;
    getKey<K extends string>(key?: K): BrandedStoreKey<StoreKey, S> & `${string}${K & string}`;
    isKey(key: unknown): key is BrandedStoreKey<StoreKey, S>;
}

export function getLogisticsStore<V extends object, S extends symbol>(prefix: string | (() => string), symbol: S): StoreInformation<V, S> {
   return {
        get prefix() {
            return getPrefix();
        },
        getKey(key) {
            return getLogisticsStoreKey(key, getPrefix());
        },
        isKey,
        store: getTypedStore<Store<BrandedStoreKey<StoreKey, S>, V>>(isKey)
    };

    function getPrefix() {
        return typeof prefix === "function" ? prefix() : prefix;
    }

    function isKey(key: unknown): key is BrandedStoreKey<StoreKey, S> {
        return isLogisticsStoreKey(key, getPrefix());
    }
}
