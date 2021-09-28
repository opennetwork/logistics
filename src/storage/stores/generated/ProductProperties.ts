import { ProductProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ProductProperties
}

const ProductPropertiesStoreKeySymbol = Symbol("ProductPropertiesStoreKey");
export type ProductPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ProductPropertiesStoreKeySymbol>

export function isProductPropertiesStoreKey(key: unknown): key is ProductPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductPropertiesStorageKeyPrefix());
}

export const LogisticsProductPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductPropertiesPrefix";
export const LogisticsProductPropertiesStorageKeyPrefixDefault = "ProductProperties/";

export function getLogisticsProductPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductPropertiesStorageKeyPrefix, LogisticsProductPropertiesStorageKeyPrefixDefault);
}

export interface ProductPropertiesStore extends Store<ProductPropertiesStoreKey, ProductProperties> {

}

export function getProductPropertiesStore() {
    return getLogisticsStore<ProductProperties, typeof ProductPropertiesStoreKeySymbol>(getLogisticsProductPropertiesStorageKeyPrefix, ProductPropertiesStoreKeySymbol);
}