import { QuantitativeValueProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    QuantitativeValueProperties
}

const QuantitativeValuePropertiesStoreKeySymbol = Symbol("QuantitativeValuePropertiesStoreKey");
export type QuantitativeValuePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof QuantitativeValuePropertiesStoreKeySymbol>

export function isQuantitativeValuePropertiesStoreKey(key: unknown): key is QuantitativeValuePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsQuantitativeValuePropertiesStorageKeyPrefix());
}

export const LogisticsQuantitativeValuePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#QuantitativeValuePropertiesPrefix";
export const LogisticsQuantitativeValuePropertiesStorageKeyPrefixDefault = "QuantitativeValueProperties/";

export function getLogisticsQuantitativeValuePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsQuantitativeValuePropertiesStorageKeyPrefix, LogisticsQuantitativeValuePropertiesStorageKeyPrefixDefault);
}

export interface QuantitativeValuePropertiesStore extends Store<QuantitativeValuePropertiesStoreKey, QuantitativeValueProperties> {

}

export function getQuantitativeValuePropertiesStore() {
    return getLogisticsStore<QuantitativeValueProperties, typeof QuantitativeValuePropertiesStoreKeySymbol>(getLogisticsQuantitativeValuePropertiesStorageKeyPrefix, QuantitativeValuePropertiesStoreKeySymbol);
}