import { MonetaryAmount } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    MonetaryAmount
}

const MonetaryAmountStoreKeySymbol = Symbol("MonetaryAmountStoreKey");
export type MonetaryAmountStoreKey = BrandedStoreKey<StoreKey, typeof MonetaryAmountStoreKeySymbol>

export function isMonetaryAmountStoreKey(key: unknown): key is MonetaryAmountStoreKey {
    return isLogisticsStoreKey(key, getLogisticsMonetaryAmountStorageKeyPrefix());
}

export const LogisticsMonetaryAmountStorageKeyPrefix = "https://logistics.opennetwork.dev/#MonetaryAmountPrefix";
export const LogisticsMonetaryAmountStorageKeyPrefixDefault = "MonetaryAmount/";

export function getLogisticsMonetaryAmountStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsMonetaryAmountStorageKeyPrefix, LogisticsMonetaryAmountStorageKeyPrefixDefault);
}

export interface MonetaryAmountStore extends Store<MonetaryAmountStoreKey, MonetaryAmount> {

}

export function getMonetaryAmountStore() {
    return getLogisticsStore<MonetaryAmount, typeof MonetaryAmountStoreKeySymbol>(getLogisticsMonetaryAmountStorageKeyPrefix, MonetaryAmountStoreKeySymbol);
}