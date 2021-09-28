import { OrderThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrderThing
}

const OrderThingStoreKeySymbol = Symbol("OrderThingStoreKey");
export type OrderThingStoreKey = BrandedStoreKey<StoreKey, typeof OrderThingStoreKeySymbol>

export function isOrderThingStoreKey(key: unknown): key is OrderThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderThingStorageKeyPrefix());
}

export const LogisticsOrderThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderThingPrefix";
export const LogisticsOrderThingStorageKeyPrefixDefault = "OrderThing/";

export function getLogisticsOrderThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderThingStorageKeyPrefix, LogisticsOrderThingStorageKeyPrefixDefault);
}

export interface OrderThingStore extends Store<OrderThingStoreKey, OrderThing> {

}

export function getOrderThingStore() {
    return getLogisticsStore<OrderThing, typeof OrderThingStoreKeySymbol>(getLogisticsOrderThingStorageKeyPrefix, OrderThingStoreKeySymbol);
}