import { ProductModelThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ProductModelThing
}

const ProductModelThingStoreKeySymbol = Symbol("ProductModelThingStoreKey");
export type ProductModelThingStoreKey = BrandedStoreKey<StoreKey, typeof ProductModelThingStoreKeySymbol>

export function isProductModelThingStoreKey(key: unknown): key is ProductModelThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductModelThingStorageKeyPrefix());
}

export const LogisticsProductModelThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductModelThingPrefix";
export const LogisticsProductModelThingStorageKeyPrefixDefault = "ProductModelThing/";

export function getLogisticsProductModelThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductModelThingStorageKeyPrefix, LogisticsProductModelThingStorageKeyPrefixDefault);
}

export interface ProductModelThingStore extends Store<ProductModelThingStoreKey, ProductModelThing> {

}

export function getProductModelThingStore() {
    return getLogisticsStore<ProductModelThing, typeof ProductModelThingStoreKeySymbol>(getLogisticsProductModelThingStorageKeyPrefix, ProductModelThingStoreKeySymbol);
}