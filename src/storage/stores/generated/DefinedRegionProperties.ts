import { DefinedRegionProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DefinedRegionProperties
}

const DefinedRegionPropertiesStoreKeySymbol = Symbol("DefinedRegionPropertiesStoreKey");
export type DefinedRegionPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof DefinedRegionPropertiesStoreKeySymbol>

export function isDefinedRegionPropertiesStoreKey(key: unknown): key is DefinedRegionPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDefinedRegionPropertiesStorageKeyPrefix());
}

export const LogisticsDefinedRegionPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#DefinedRegionPropertiesPrefix";
export const LogisticsDefinedRegionPropertiesStorageKeyPrefixDefault = "DefinedRegionProperties/";

export function getLogisticsDefinedRegionPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDefinedRegionPropertiesStorageKeyPrefix, LogisticsDefinedRegionPropertiesStorageKeyPrefixDefault);
}

export interface DefinedRegionPropertiesStore extends Store<DefinedRegionPropertiesStoreKey, DefinedRegionProperties> {

}

export function getDefinedRegionPropertiesStore() {
    return getLogisticsStore<DefinedRegionProperties, typeof DefinedRegionPropertiesStoreKeySymbol>(getLogisticsDefinedRegionPropertiesStorageKeyPrefix, DefinedRegionPropertiesStoreKeySymbol);
}