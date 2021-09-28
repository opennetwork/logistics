import { Brand } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Brand
}

const BrandStoreKeySymbol = Symbol("BrandStoreKey");
export type BrandStoreKey = BrandedStoreKey<StoreKey, typeof BrandStoreKeySymbol>

export function isBrandStoreKey(key: unknown): key is BrandStoreKey {
    return isLogisticsStoreKey(key, getLogisticsBrandStorageKeyPrefix());
}

export const LogisticsBrandStorageKeyPrefix = "https://logistics.opennetwork.dev/#BrandPrefix";
export const LogisticsBrandStorageKeyPrefixDefault = "Brand/";

export function getLogisticsBrandStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsBrandStorageKeyPrefix, LogisticsBrandStorageKeyPrefixDefault);
}

export interface BrandStore extends Store<BrandStoreKey, Brand> {

}

export function getBrandStore() {
    return getLogisticsStore<Brand, typeof BrandStoreKeySymbol>(getLogisticsBrandStorageKeyPrefix, BrandStoreKeySymbol);
}