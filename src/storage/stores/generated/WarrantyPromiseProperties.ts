import { WarrantyPromiseProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyPromiseProperties
}

const WarrantyPromisePropertiesStoreKeySymbol = Symbol("WarrantyPromisePropertiesStoreKey");
export type WarrantyPromisePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyPromisePropertiesStoreKeySymbol>

export function isWarrantyPromisePropertiesStoreKey(key: unknown): key is WarrantyPromisePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyPromisePropertiesStorageKeyPrefix());
}

export const LogisticsWarrantyPromisePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyPromisePropertiesPrefix";
export const LogisticsWarrantyPromisePropertiesStorageKeyPrefixDefault = "WarrantyPromiseProperties/";

export function getLogisticsWarrantyPromisePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyPromisePropertiesStorageKeyPrefix, LogisticsWarrantyPromisePropertiesStorageKeyPrefixDefault);
}

export interface WarrantyPromisePropertiesStore extends Store<WarrantyPromisePropertiesStoreKey, WarrantyPromiseProperties> {

}

export function getWarrantyPromisePropertiesStore() {
    return getLogisticsStore<WarrantyPromiseProperties, typeof WarrantyPromisePropertiesStoreKeySymbol>(getLogisticsWarrantyPromisePropertiesStorageKeyPrefix, WarrantyPromisePropertiesStoreKeySymbol);
}