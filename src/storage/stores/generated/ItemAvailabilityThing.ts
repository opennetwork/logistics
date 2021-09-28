import { ItemAvailabilityThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ItemAvailabilityThing
}

const ItemAvailabilityThingStoreKeySymbol = Symbol("ItemAvailabilityThingStoreKey");
export type ItemAvailabilityThingStoreKey = BrandedStoreKey<StoreKey, typeof ItemAvailabilityThingStoreKeySymbol>

export function isItemAvailabilityThingStoreKey(key: unknown): key is ItemAvailabilityThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsItemAvailabilityThingStorageKeyPrefix());
}

export const LogisticsItemAvailabilityThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ItemAvailabilityThingPrefix";
export const LogisticsItemAvailabilityThingStorageKeyPrefixDefault = "ItemAvailabilityThing/";

export function getLogisticsItemAvailabilityThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsItemAvailabilityThingStorageKeyPrefix, LogisticsItemAvailabilityThingStorageKeyPrefixDefault);
}

export interface ItemAvailabilityThingStore extends Store<ItemAvailabilityThingStoreKey, ItemAvailabilityThing> {

}

export function getItemAvailabilityThingStore() {
    return getLogisticsStore<ItemAvailabilityThing, typeof ItemAvailabilityThingStoreKeySymbol>(getLogisticsItemAvailabilityThingStorageKeyPrefix, ItemAvailabilityThingStoreKeySymbol);
}