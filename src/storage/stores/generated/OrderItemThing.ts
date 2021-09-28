import { OrderItemThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrderItemThing
}

const OrderItemThingStoreKeySymbol = Symbol("OrderItemThingStoreKey");
export type OrderItemThingStoreKey = BrandedStoreKey<StoreKey, typeof OrderItemThingStoreKeySymbol>

export function isOrderItemThingStoreKey(key: unknown): key is OrderItemThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderItemThingStorageKeyPrefix());
}

export const LogisticsOrderItemThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderItemThingPrefix";
export const LogisticsOrderItemThingStorageKeyPrefixDefault = "OrderItemThing/";

export function getLogisticsOrderItemThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderItemThingStorageKeyPrefix, LogisticsOrderItemThingStorageKeyPrefixDefault);
}

export interface OrderItemThingStore extends Store<OrderItemThingStoreKey, OrderItemThing> {

}

export function getOrderItemThingStore() {
    return getLogisticsStore<OrderItemThing, typeof OrderItemThingStoreKeySymbol>(getLogisticsOrderItemThingStorageKeyPrefix, OrderItemThingStoreKeySymbol);
}