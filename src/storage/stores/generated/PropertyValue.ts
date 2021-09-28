import { PropertyValue } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PropertyValue
}

const PropertyValueStoreKeySymbol = Symbol("PropertyValueStoreKey");
export type PropertyValueStoreKey = BrandedStoreKey<StoreKey, typeof PropertyValueStoreKeySymbol>

export function isPropertyValueStoreKey(key: unknown): key is PropertyValueStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPropertyValueStorageKeyPrefix());
}

export const LogisticsPropertyValueStorageKeyPrefix = "https://logistics.opennetwork.dev/#PropertyValuePrefix";
export const LogisticsPropertyValueStorageKeyPrefixDefault = "PropertyValue/";

export function getLogisticsPropertyValueStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPropertyValueStorageKeyPrefix, LogisticsPropertyValueStorageKeyPrefixDefault);
}

export interface PropertyValueStore extends Store<PropertyValueStoreKey, PropertyValue> {

}

export function getPropertyValueStore() {
    return getLogisticsStore<PropertyValue, typeof PropertyValueStoreKeySymbol>(getLogisticsPropertyValueStorageKeyPrefix, PropertyValueStoreKeySymbol);
}