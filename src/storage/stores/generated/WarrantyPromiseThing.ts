import { WarrantyPromiseThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyPromiseThing
}

const WarrantyPromiseThingStoreKeySymbol = Symbol("WarrantyPromiseThingStoreKey");
export type WarrantyPromiseThingStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyPromiseThingStoreKeySymbol>

export function isWarrantyPromiseThingStoreKey(key: unknown): key is WarrantyPromiseThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyPromiseThingStorageKeyPrefix());
}

export const LogisticsWarrantyPromiseThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyPromiseThingPrefix";
export const LogisticsWarrantyPromiseThingStorageKeyPrefixDefault = "WarrantyPromiseThing/";

export function getLogisticsWarrantyPromiseThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyPromiseThingStorageKeyPrefix, LogisticsWarrantyPromiseThingStorageKeyPrefixDefault);
}

export interface WarrantyPromiseThingStore extends Store<WarrantyPromiseThingStoreKey, WarrantyPromiseThing> {

}

export function getWarrantyPromiseThingStore() {
    return getLogisticsStore<WarrantyPromiseThing, typeof WarrantyPromiseThingStoreKeySymbol>(getLogisticsWarrantyPromiseThingStorageKeyPrefix, WarrantyPromiseThingStoreKeySymbol);
}