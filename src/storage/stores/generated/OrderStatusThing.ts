import { OrderStatusThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrderStatusThing
}

const OrderStatusThingStoreKeySymbol = Symbol("OrderStatusThingStoreKey");
export type OrderStatusThingStoreKey = BrandedStoreKey<StoreKey, typeof OrderStatusThingStoreKeySymbol>

export function isOrderStatusThingStoreKey(key: unknown): key is OrderStatusThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderStatusThingStorageKeyPrefix());
}

export const LogisticsOrderStatusThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderStatusThingPrefix";
export const LogisticsOrderStatusThingStorageKeyPrefixDefault = "OrderStatusThing/";

export function getLogisticsOrderStatusThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderStatusThingStorageKeyPrefix, LogisticsOrderStatusThingStorageKeyPrefixDefault);
}

export interface OrderStatusThingStore extends Store<OrderStatusThingStoreKey, OrderStatusThing> {

}

export function getOrderStatusThingStore() {
    return getLogisticsStore<OrderStatusThing, typeof OrderStatusThingStoreKeySymbol>(getLogisticsOrderStatusThingStorageKeyPrefix, OrderStatusThingStoreKeySymbol);
}