import { FinancialProductThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    FinancialProductThing
}

const FinancialProductThingStoreKeySymbol = Symbol("FinancialProductThingStoreKey");
export type FinancialProductThingStoreKey = BrandedStoreKey<StoreKey, typeof FinancialProductThingStoreKeySymbol>

export function isFinancialProductThingStoreKey(key: unknown): key is FinancialProductThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsFinancialProductThingStorageKeyPrefix());
}

export const LogisticsFinancialProductThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#FinancialProductThingPrefix";
export const LogisticsFinancialProductThingStorageKeyPrefixDefault = "FinancialProductThing/";

export function getLogisticsFinancialProductThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsFinancialProductThingStorageKeyPrefix, LogisticsFinancialProductThingStorageKeyPrefixDefault);
}

export interface FinancialProductThingStore extends Store<FinancialProductThingStoreKey, FinancialProductThing> {

}

export function getFinancialProductThingStore() {
    return getLogisticsStore<FinancialProductThing, typeof FinancialProductThingStoreKeySymbol>(getLogisticsFinancialProductThingStorageKeyPrefix, FinancialProductThingStoreKeySymbol);
}