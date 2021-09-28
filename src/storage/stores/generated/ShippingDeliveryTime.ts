import { ShippingDeliveryTime } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ShippingDeliveryTime
}

const ShippingDeliveryTimeStoreKeySymbol = Symbol("ShippingDeliveryTimeStoreKey");
export type ShippingDeliveryTimeStoreKey = BrandedStoreKey<StoreKey, typeof ShippingDeliveryTimeStoreKeySymbol>

export function isShippingDeliveryTimeStoreKey(key: unknown): key is ShippingDeliveryTimeStoreKey {
    return isLogisticsStoreKey(key, getLogisticsShippingDeliveryTimeStorageKeyPrefix());
}

export const LogisticsShippingDeliveryTimeStorageKeyPrefix = "https://logistics.opennetwork.dev/#ShippingDeliveryTimePrefix";
export const LogisticsShippingDeliveryTimeStorageKeyPrefixDefault = "ShippingDeliveryTime/";

export function getLogisticsShippingDeliveryTimeStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsShippingDeliveryTimeStorageKeyPrefix, LogisticsShippingDeliveryTimeStorageKeyPrefixDefault);
}

export interface ShippingDeliveryTimeStore extends Store<ShippingDeliveryTimeStoreKey, ShippingDeliveryTime> {

}

export function getShippingDeliveryTimeStore() {
    return getLogisticsStore<ShippingDeliveryTime, typeof ShippingDeliveryTimeStoreKeySymbol>(getLogisticsShippingDeliveryTimeStorageKeyPrefix, ShippingDeliveryTimeStoreKeySymbol);
}