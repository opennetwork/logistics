import { ProductThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ProductThing
}

const ProductThingStoreKeySymbol = Symbol("ProductThingStoreKey");
export type ProductThingStoreKey = BrandedStoreKey<StoreKey, typeof ProductThingStoreKeySymbol>

export function isProductThingStoreKey(key: unknown): key is ProductThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsProductThingStorageKeyPrefix());
}

export const LogisticsProductThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ProductThingPrefix";
export const LogisticsProductThingStorageKeyPrefixDefault = "ProductThing/";

export function getLogisticsProductThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsProductThingStorageKeyPrefix, LogisticsProductThingStorageKeyPrefixDefault);
}

export interface ProductThingStore extends Store<ProductThingStoreKey, ProductThing> {

}

export function getProductThingStore() {
    return getLogisticsStore<ProductThing, typeof ProductThingStoreKeySymbol>(getLogisticsProductThingStorageKeyPrefix, ProductThingStoreKeySymbol);
}