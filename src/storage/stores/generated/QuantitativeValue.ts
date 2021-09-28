import { QuantitativeValue } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    QuantitativeValue
}

const QuantitativeValueStoreKeySymbol = Symbol("QuantitativeValueStoreKey");
export type QuantitativeValueStoreKey = BrandedStoreKey<StoreKey, typeof QuantitativeValueStoreKeySymbol>

export function isQuantitativeValueStoreKey(key: unknown): key is QuantitativeValueStoreKey {
    return isLogisticsStoreKey(key, getLogisticsQuantitativeValueStorageKeyPrefix());
}

export const LogisticsQuantitativeValueStorageKeyPrefix = "https://logistics.opennetwork.dev/#QuantitativeValuePrefix";
export const LogisticsQuantitativeValueStorageKeyPrefixDefault = "QuantitativeValue/";

export function getLogisticsQuantitativeValueStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsQuantitativeValueStorageKeyPrefix, LogisticsQuantitativeValueStorageKeyPrefixDefault);
}

export interface QuantitativeValueStore extends Store<QuantitativeValueStoreKey, QuantitativeValue> {

}

export function getQuantitativeValueStore() {
    return getLogisticsStore<QuantitativeValue, typeof QuantitativeValueStoreKeySymbol>(getLogisticsQuantitativeValueStorageKeyPrefix, QuantitativeValueStoreKeySymbol);
}