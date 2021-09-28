import { ProductModel } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ProductModel
}

const ProductModelStoreKeySymbol = Symbol("ProductModelStoreKey");
export type ProductModelStoreKey = BrandedStoreKey<StoreKey, typeof ProductModelStoreKeySymbol>

export function isProductModelStoreKey(key: unknown): key is ProductModelStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductModelStorageKeyPrefix());
}

export const LogisticsProductModelStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductModelPrefix";
export const LogisticsProductModelStorageKeyPrefixDefault = "ProductModel/";

export function getLogisticsProductModelStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductModelStorageKeyPrefix, LogisticsProductModelStorageKeyPrefixDefault);
}

export interface ProductModelStore extends Store<ProductModelStoreKey, ProductModel> {

}

export function getProductModelStore() {
    return getLogisticsStore<ProductModel, typeof ProductModelStoreKeySymbol>(getLogisticsProductModelStorageKeyPrefix, ProductModelStoreKeySymbol);
}