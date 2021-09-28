import { OrderItem } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrderItem
}

const OrderItemStoreKeySymbol = Symbol("OrderItemStoreKey");
export type OrderItemStoreKey = BrandedStoreKey<StoreKey, typeof OrderItemStoreKeySymbol>

export function isOrderItemStoreKey(key: unknown): key is OrderItemStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderItemStorageKeyPrefix());
}

export const LogisticsOrderItemStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderItemPrefix";
export const LogisticsOrderItemStorageKeyPrefixDefault = "OrderItem/";

export function getLogisticsOrderItemStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderItemStorageKeyPrefix, LogisticsOrderItemStorageKeyPrefixDefault);
}

export interface OrderItemStore extends Store<OrderItemStoreKey, OrderItem> {

}

export function getOrderItemStore() {
    return getLogisticsStore<OrderItem, typeof OrderItemStoreKeySymbol>(getLogisticsOrderItemStorageKeyPrefix, OrderItemStoreKeySymbol);
}