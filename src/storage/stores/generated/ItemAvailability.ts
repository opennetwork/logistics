import { ItemAvailability } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ItemAvailability
}

const ItemAvailabilityStoreKeySymbol = Symbol("ItemAvailabilityStoreKey");
export type ItemAvailabilityStoreKey = BrandedStoreKey<StoreKey, typeof ItemAvailabilityStoreKeySymbol>

export function isItemAvailabilityStoreKey(key: unknown): key is ItemAvailabilityStoreKey {
    return isLogisticsStoreKey(key, getLogisticsItemAvailabilityStorageKeyPrefix());
}

export const LogisticsItemAvailabilityStorageKeyPrefix = "https://logistics.opennetwork.dev/#ItemAvailabilityPrefix";
export const LogisticsItemAvailabilityStorageKeyPrefixDefault = "ItemAvailability/";

export function getLogisticsItemAvailabilityStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsItemAvailabilityStorageKeyPrefix, LogisticsItemAvailabilityStorageKeyPrefixDefault);
}

export interface ItemAvailabilityStore extends Store<ItemAvailabilityStoreKey, ItemAvailability> {

}

export function getItemAvailabilityStore() {
    return getLogisticsStore<ItemAvailability, typeof ItemAvailabilityStoreKeySymbol>(getLogisticsItemAvailabilityStorageKeyPrefix, ItemAvailabilityStoreKeySymbol);
}