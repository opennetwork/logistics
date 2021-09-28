import { OfferThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferThing
}

const OfferThingStoreKeySymbol = Symbol("OfferThingStoreKey");
export type OfferThingStoreKey = BrandedStoreKey<StoreKey, typeof OfferThingStoreKeySymbol>

export function isOfferThingStoreKey(key: unknown): key is OfferThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferThingStorageKeyPrefix());
}

export const LogisticsOfferThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferThingPrefix";
export const LogisticsOfferThingStorageKeyPrefixDefault = "OfferThing/";

export function getLogisticsOfferThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferThingStorageKeyPrefix, LogisticsOfferThingStorageKeyPrefixDefault);
}

export interface OfferThingStore extends Store<OfferThingStoreKey, OfferThing> {

}

export function getOfferThingStore() {
    return getLogisticsStore<OfferThing, typeof OfferThingStoreKeySymbol>(getLogisticsOfferThingStorageKeyPrefix, OfferThingStoreKeySymbol);
}