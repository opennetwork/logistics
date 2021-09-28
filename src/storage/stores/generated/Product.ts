import { Product } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Product
}

const ProductStoreKeySymbol = Symbol("ProductStoreKey");
export type ProductStoreKey = BrandedStoreKey<StoreKey, typeof ProductStoreKeySymbol>

export function isProductStoreKey(key: unknown): key is ProductStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductStorageKeyPrefix());
}

export const LogisticsProductStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductPrefix";
export const LogisticsProductStorageKeyPrefixDefault = "Product/";

export function getLogisticsProductStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductStorageKeyPrefix, LogisticsProductStorageKeyPrefixDefault);
}

export interface ProductStore extends Store<ProductStoreKey, Product> {

}

export function getProductStore() {
    return getLogisticsStore<Product, typeof ProductStoreKeySymbol>(getLogisticsProductStorageKeyPrefix, ProductStoreKeySymbol);
}