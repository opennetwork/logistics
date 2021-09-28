import { WarrantyScope } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyScope
}

const WarrantyScopeStoreKeySymbol = Symbol("WarrantyScopeStoreKey");
export type WarrantyScopeStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyScopeStoreKeySymbol>

export function isWarrantyScopeStoreKey(key: unknown): key is WarrantyScopeStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyScopeStorageKeyPrefix());
}

export const LogisticsWarrantyScopeStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyScopePrefix";
export const LogisticsWarrantyScopeStorageKeyPrefixDefault = "WarrantyScope/";

export function getLogisticsWarrantyScopeStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyScopeStorageKeyPrefix, LogisticsWarrantyScopeStorageKeyPrefixDefault);
}

export interface WarrantyScopeStore extends Store<WarrantyScopeStoreKey, WarrantyScope> {

}

export function getWarrantyScopeStore() {
    return getLogisticsStore<WarrantyScope, typeof WarrantyScopeStoreKeySymbol>(getLogisticsWarrantyScopeStorageKeyPrefix, WarrantyScopeStoreKeySymbol);
}