import { WarrantyPromise } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyPromise
}

const WarrantyPromiseStoreKeySymbol = Symbol("WarrantyPromiseStoreKey");
export type WarrantyPromiseStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyPromiseStoreKeySymbol>

export function isWarrantyPromiseStoreKey(key: unknown): key is WarrantyPromiseStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyPromiseStorageKeyPrefix());
}

export const LogisticsWarrantyPromiseStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyPromisePrefix";
export const LogisticsWarrantyPromiseStorageKeyPrefixDefault = "WarrantyPromise/";

export function getLogisticsWarrantyPromiseStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyPromiseStorageKeyPrefix, LogisticsWarrantyPromiseStorageKeyPrefixDefault);
}

export interface WarrantyPromiseStore extends Store<WarrantyPromiseStoreKey, WarrantyPromise> {

}

export function getWarrantyPromiseStore() {
    return getLogisticsStore<WarrantyPromise, typeof WarrantyPromiseStoreKeySymbol>(getLogisticsWarrantyPromiseStorageKeyPrefix, WarrantyPromiseStoreKeySymbol);
}