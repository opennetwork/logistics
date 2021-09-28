import { OfferItemConditionThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferItemConditionThing
}

const OfferItemConditionThingStoreKeySymbol = Symbol("OfferItemConditionThingStoreKey");
export type OfferItemConditionThingStoreKey = BrandedStoreKey<StoreKey, typeof OfferItemConditionThingStoreKeySymbol>

export function isOfferItemConditionThingStoreKey(key: unknown): key is OfferItemConditionThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferItemConditionThingStorageKeyPrefix());
}

export const LogisticsOfferItemConditionThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferItemConditionThingPrefix";
export const LogisticsOfferItemConditionThingStorageKeyPrefixDefault = "OfferItemConditionThing/";

export function getLogisticsOfferItemConditionThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferItemConditionThingStorageKeyPrefix, LogisticsOfferItemConditionThingStorageKeyPrefixDefault);
}

export interface OfferItemConditionThingStore extends Store<OfferItemConditionThingStoreKey, OfferItemConditionThing> {

}

export function getOfferItemConditionThingStore() {
    return getLogisticsStore<OfferItemConditionThing, typeof OfferItemConditionThingStoreKeySymbol>(getLogisticsOfferItemConditionThingStorageKeyPrefix, OfferItemConditionThingStoreKeySymbol);
}