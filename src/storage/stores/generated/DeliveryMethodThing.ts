import { DeliveryMethodThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DeliveryMethodThing
}

const DeliveryMethodThingStoreKeySymbol = Symbol("DeliveryMethodThingStoreKey");
export type DeliveryMethodThingStoreKey = BrandedStoreKey<StoreKey, typeof DeliveryMethodThingStoreKeySymbol>

export function isDeliveryMethodThingStoreKey(key: unknown): key is DeliveryMethodThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDeliveryMethodThingStorageKeyPrefix());
}

export const LogisticsDeliveryMethodThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DeliveryMethodThingPrefix";
export const LogisticsDeliveryMethodThingStorageKeyPrefixDefault = "DeliveryMethodThing/";

export function getLogisticsDeliveryMethodThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDeliveryMethodThingStorageKeyPrefix, LogisticsDeliveryMethodThingStorageKeyPrefixDefault);
}

export interface DeliveryMethodThingStore extends Store<DeliveryMethodThingStoreKey, DeliveryMethodThing> {

}

export function getDeliveryMethodThingStore() {
    return getLogisticsStore<DeliveryMethodThing, typeof DeliveryMethodThingStoreKeySymbol>(getLogisticsDeliveryMethodThingStorageKeyPrefix, DeliveryMethodThingStoreKeySymbol);
}