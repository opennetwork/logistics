import { DeliveryEventThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DeliveryEventThing
}

const DeliveryEventThingStoreKeySymbol = Symbol("DeliveryEventThingStoreKey");
export type DeliveryEventThingStoreKey = BrandedStoreKey<StoreKey, typeof DeliveryEventThingStoreKeySymbol>

export function isDeliveryEventThingStoreKey(key: unknown): key is DeliveryEventThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDeliveryEventThingStorageKeyPrefix());
}

export const LogisticsDeliveryEventThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DeliveryEventThingPrefix";
export const LogisticsDeliveryEventThingStorageKeyPrefixDefault = "DeliveryEventThing/";

export function getLogisticsDeliveryEventThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDeliveryEventThingStorageKeyPrefix, LogisticsDeliveryEventThingStorageKeyPrefixDefault);
}

export interface DeliveryEventThingStore extends Store<DeliveryEventThingStoreKey, DeliveryEventThing> {

}

export function getDeliveryEventThingStore() {
    return getLogisticsStore<DeliveryEventThing, typeof DeliveryEventThingStoreKeySymbol>(getLogisticsDeliveryEventThingStorageKeyPrefix, DeliveryEventThingStoreKeySymbol);
}