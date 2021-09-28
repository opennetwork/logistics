import { Order } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Order
}

const OrderStoreKeySymbol = Symbol("OrderStoreKey");
export type OrderStoreKey = BrandedStoreKey<StoreKey, typeof OrderStoreKeySymbol>

export function isOrderStoreKey(key: unknown): key is OrderStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderStorageKeyPrefix());
}

export const LogisticsOrderStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderPrefix";
export const LogisticsOrderStorageKeyPrefixDefault = "Order/";

export function getLogisticsOrderStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderStorageKeyPrefix, LogisticsOrderStorageKeyPrefixDefault);
}

export interface OrderStore extends Store<OrderStoreKey, Order> {

}

export function getOrderStore() {
    return getLogisticsStore<Order, typeof OrderStoreKeySymbol>(getLogisticsOrderStorageKeyPrefix, OrderStoreKeySymbol);
}