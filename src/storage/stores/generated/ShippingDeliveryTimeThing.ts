import { ShippingDeliveryTimeThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ShippingDeliveryTimeThing
}

const ShippingDeliveryTimeThingStoreKeySymbol = Symbol("ShippingDeliveryTimeThingStoreKey");
export type ShippingDeliveryTimeThingStoreKey = BrandedStoreKey<StoreKey, typeof ShippingDeliveryTimeThingStoreKeySymbol>

export function isShippingDeliveryTimeThingStoreKey(key: unknown): key is ShippingDeliveryTimeThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsShippingDeliveryTimeThingStorageKeyPrefix());
}

export const LogisticsShippingDeliveryTimeThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ShippingDeliveryTimeThingPrefix";
export const LogisticsShippingDeliveryTimeThingStorageKeyPrefixDefault = "ShippingDeliveryTimeThing/";

export function getLogisticsShippingDeliveryTimeThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsShippingDeliveryTimeThingStorageKeyPrefix, LogisticsShippingDeliveryTimeThingStorageKeyPrefixDefault);
}

export interface ShippingDeliveryTimeThingStore extends Store<ShippingDeliveryTimeThingStoreKey, ShippingDeliveryTimeThing> {

}

export function getShippingDeliveryTimeThingStore() {
    return getLogisticsStore<ShippingDeliveryTimeThing, typeof ShippingDeliveryTimeThingStoreKeySymbol>(getLogisticsShippingDeliveryTimeThingStorageKeyPrefix, ShippingDeliveryTimeThingStoreKeySymbol);
}