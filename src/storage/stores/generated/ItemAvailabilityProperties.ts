import { ItemAvailabilityProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ItemAvailabilityProperties
}

const ItemAvailabilityPropertiesStoreKeySymbol = Symbol("ItemAvailabilityPropertiesStoreKey");
export type ItemAvailabilityPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ItemAvailabilityPropertiesStoreKeySymbol>

export function isItemAvailabilityPropertiesStoreKey(key: unknown): key is ItemAvailabilityPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsItemAvailabilityPropertiesStorageKeyPrefix());
}

export const LogisticsItemAvailabilityPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ItemAvailabilityPropertiesPrefix";
export const LogisticsItemAvailabilityPropertiesStorageKeyPrefixDefault = "ItemAvailabilityProperties/";

export function getLogisticsItemAvailabilityPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsItemAvailabilityPropertiesStorageKeyPrefix, LogisticsItemAvailabilityPropertiesStorageKeyPrefixDefault);
}

export interface ItemAvailabilityPropertiesStore extends Store<ItemAvailabilityPropertiesStoreKey, ItemAvailabilityProperties> {

}

export function getItemAvailabilityPropertiesStore() {
    return getLogisticsStore<ItemAvailabilityProperties, typeof ItemAvailabilityPropertiesStoreKeySymbol>(getLogisticsItemAvailabilityPropertiesStorageKeyPrefix, ItemAvailabilityPropertiesStoreKeySymbol);
}