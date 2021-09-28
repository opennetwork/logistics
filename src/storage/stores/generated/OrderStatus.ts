import { OrderStatus } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrderStatus
}

const OrderStatusStoreKeySymbol = Symbol("OrderStatusStoreKey");
export type OrderStatusStoreKey = BrandedStoreKey<StoreKey, typeof OrderStatusStoreKeySymbol>

export function isOrderStatusStoreKey(key: unknown): key is OrderStatusStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrderStatusStorageKeyPrefix());
}

export const LogisticsOrderStatusStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrderStatusPrefix";
export const LogisticsOrderStatusStorageKeyPrefixDefault = "OrderStatus/";

export function getLogisticsOrderStatusStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrderStatusStorageKeyPrefix, LogisticsOrderStatusStorageKeyPrefixDefault);
}

export interface OrderStatusStore extends Store<OrderStatusStoreKey, OrderStatus> {

}

export function getOrderStatusStore() {
    return getLogisticsStore<OrderStatus, typeof OrderStatusStoreKeySymbol>(getLogisticsOrderStatusStorageKeyPrefix, OrderStatusStoreKeySymbol);
}