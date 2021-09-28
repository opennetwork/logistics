import { ProductModelProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ProductModelProperties
}

const ProductModelPropertiesStoreKeySymbol = Symbol("ProductModelPropertiesStoreKey");
export type ProductModelPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ProductModelPropertiesStoreKeySymbol>

export function isProductModelPropertiesStoreKey(key: unknown): key is ProductModelPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductModelPropertiesStorageKeyPrefix());
}

export const LogisticsProductModelPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductModelPropertiesPrefix";
export const LogisticsProductModelPropertiesStorageKeyPrefixDefault = "ProductModelProperties/";

export function getLogisticsProductModelPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductModelPropertiesStorageKeyPrefix, LogisticsProductModelPropertiesStorageKeyPrefixDefault);
}

export interface ProductModelPropertiesStore extends Store<ProductModelPropertiesStoreKey, ProductModelProperties> {

}

export function getProductModelPropertiesStore() {
    return getLogisticsStore<ProductModelProperties, typeof ProductModelPropertiesStoreKeySymbol>(getLogisticsProductModelPropertiesStorageKeyPrefix, ProductModelPropertiesStoreKeySymbol);
}