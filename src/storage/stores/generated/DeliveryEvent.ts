import { DeliveryEvent } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DeliveryEvent
}

const DeliveryEventStoreKeySymbol = Symbol("DeliveryEventStoreKey");
export type DeliveryEventStoreKey = BrandedStoreKey<StoreKey, typeof DeliveryEventStoreKeySymbol>

export function isDeliveryEventStoreKey(key: unknown): key is DeliveryEventStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDeliveryEventStorageKeyPrefix());
}

export const LogisticsDeliveryEventStorageKeyPrefix = "https://logistics.opennetwork.dev/#DeliveryEventPrefix";
export const LogisticsDeliveryEventStorageKeyPrefixDefault = "DeliveryEvent/";

export function getLogisticsDeliveryEventStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDeliveryEventStorageKeyPrefix, LogisticsDeliveryEventStorageKeyPrefixDefault);
}

export interface DeliveryEventStore extends Store<DeliveryEventStoreKey, DeliveryEvent> {

}

export function getDeliveryEventStore() {
    return getLogisticsStore<DeliveryEvent, typeof DeliveryEventStoreKeySymbol>(getLogisticsDeliveryEventStorageKeyPrefix, DeliveryEventStoreKeySymbol);
}