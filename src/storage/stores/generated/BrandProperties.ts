import { BrandProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    BrandProperties
}

const BrandPropertiesStoreKeySymbol = Symbol("BrandPropertiesStoreKey");
export type BrandPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof BrandPropertiesStoreKeySymbol>

export function isBrandPropertiesStoreKey(key: unknown): key is BrandPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsBrandPropertiesStorageKeyPrefix());
}

export const LogisticsBrandPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#BrandPropertiesPrefix";
export const LogisticsBrandPropertiesStorageKeyPrefixDefault = "BrandProperties/";

export function getLogisticsBrandPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsBrandPropertiesStorageKeyPrefix, LogisticsBrandPropertiesStorageKeyPrefixDefault);
}

export interface BrandPropertiesStore extends Store<BrandPropertiesStoreKey, BrandProperties> {

}

export function getBrandPropertiesStore() {
    return getLogisticsStore<BrandProperties, typeof BrandPropertiesStoreKeySymbol>(getLogisticsBrandPropertiesStorageKeyPrefix, BrandPropertiesStoreKeySymbol);
}