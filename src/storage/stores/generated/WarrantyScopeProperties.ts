import { WarrantyScopeProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyScopeProperties
}

const WarrantyScopePropertiesStoreKeySymbol = Symbol("WarrantyScopePropertiesStoreKey");
export type WarrantyScopePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyScopePropertiesStoreKeySymbol>

export function isWarrantyScopePropertiesStoreKey(key: unknown): key is WarrantyScopePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyScopePropertiesStorageKeyPrefix());
}

export const LogisticsWarrantyScopePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyScopePropertiesPrefix";
export const LogisticsWarrantyScopePropertiesStorageKeyPrefixDefault = "WarrantyScopeProperties/";

export function getLogisticsWarrantyScopePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyScopePropertiesStorageKeyPrefix, LogisticsWarrantyScopePropertiesStorageKeyPrefixDefault);
}

export interface WarrantyScopePropertiesStore extends Store<WarrantyScopePropertiesStoreKey, WarrantyScopeProperties> {

}

export function getWarrantyScopePropertiesStore() {
    return getLogisticsStore<WarrantyScopeProperties, typeof WarrantyScopePropertiesStoreKeySymbol>(getLogisticsWarrantyScopePropertiesStorageKeyPrefix, WarrantyScopePropertiesStoreKeySymbol);
}