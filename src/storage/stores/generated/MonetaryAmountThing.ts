import { MonetaryAmountThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    MonetaryAmountThing
}

const MonetaryAmountThingStoreKeySymbol = Symbol("MonetaryAmountThingStoreKey");
export type MonetaryAmountThingStoreKey = BrandedStoreKey<StoreKey, typeof MonetaryAmountThingStoreKeySymbol>

export function isMonetaryAmountThingStoreKey(key: unknown): key is MonetaryAmountThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsMonetaryAmountThingStorageKeyPrefix());
}

export const LogisticsMonetaryAmountThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#MonetaryAmountThingPrefix";
export const LogisticsMonetaryAmountThingStorageKeyPrefixDefault = "MonetaryAmountThing/";

export function getLogisticsMonetaryAmountThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsMonetaryAmountThingStorageKeyPrefix, LogisticsMonetaryAmountThingStorageKeyPrefixDefault);
}

export interface MonetaryAmountThingStore extends Store<MonetaryAmountThingStoreKey, MonetaryAmountThing> {

}

export function getMonetaryAmountThingStore() {
    return getLogisticsStore<MonetaryAmountThing, typeof MonetaryAmountThingStoreKeySymbol>(getLogisticsMonetaryAmountThingStorageKeyPrefix, MonetaryAmountThingStoreKeySymbol);
}