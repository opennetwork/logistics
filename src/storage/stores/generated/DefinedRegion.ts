import { DefinedRegion } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DefinedRegion
}

const DefinedRegionStoreKeySymbol = Symbol("DefinedRegionStoreKey");
export type DefinedRegionStoreKey = BrandedStoreKey<StoreKey, typeof DefinedRegionStoreKeySymbol>

export function isDefinedRegionStoreKey(key: unknown): key is DefinedRegionStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDefinedRegionStorageKeyPrefix());
}

export const LogisticsDefinedRegionStorageKeyPrefix = "https://logistics.opennetwork.dev/#DefinedRegionPrefix";
export const LogisticsDefinedRegionStorageKeyPrefixDefault = "DefinedRegion/";

export function getLogisticsDefinedRegionStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDefinedRegionStorageKeyPrefix, LogisticsDefinedRegionStorageKeyPrefixDefault);
}

export interface DefinedRegionStore extends Store<DefinedRegionStoreKey, DefinedRegion> {

}

export function getDefinedRegionStore() {
    return getLogisticsStore<DefinedRegion, typeof DefinedRegionStoreKeySymbol>(getLogisticsDefinedRegionStorageKeyPrefix, DefinedRegionStoreKeySymbol);
}