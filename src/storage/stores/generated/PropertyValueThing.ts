import { PropertyValueThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PropertyValueThing
}

const PropertyValueThingStoreKeySymbol = Symbol("PropertyValueThingStoreKey");
export type PropertyValueThingStoreKey = BrandedStoreKey<StoreKey, typeof PropertyValueThingStoreKeySymbol>

export function isPropertyValueThingStoreKey(key: unknown): key is PropertyValueThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPropertyValueThingStorageKeyPrefix());
}

export const LogisticsPropertyValueThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#PropertyValueThingPrefix";
export const LogisticsPropertyValueThingStorageKeyPrefixDefault = "PropertyValueThing/";

export function getLogisticsPropertyValueThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPropertyValueThingStorageKeyPrefix, LogisticsPropertyValueThingStorageKeyPrefixDefault);
}

export interface PropertyValueThingStore extends Store<PropertyValueThingStoreKey, PropertyValueThing> {

}

export function getPropertyValueThingStore() {
    return getLogisticsStore<PropertyValueThing, typeof PropertyValueThingStoreKeySymbol>(getLogisticsPropertyValueThingStorageKeyPrefix, PropertyValueThingStoreKeySymbol);
}