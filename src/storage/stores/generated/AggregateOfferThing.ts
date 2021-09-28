import { AggregateOfferThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    AggregateOfferThing
}

const AggregateOfferThingStoreKeySymbol = Symbol("AggregateOfferThingStoreKey");
export type AggregateOfferThingStoreKey = BrandedStoreKey<StoreKey, typeof AggregateOfferThingStoreKeySymbol>

export function isAggregateOfferThingStoreKey(key: unknown): key is AggregateOfferThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsAggregateOfferThingStorageKeyPrefix());
}

export const LogisticsAggregateOfferThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#AggregateOfferThingPrefix";
export const LogisticsAggregateOfferThingStorageKeyPrefixDefault = "AggregateOfferThing/";

export function getLogisticsAggregateOfferThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsAggregateOfferThingStorageKeyPrefix, LogisticsAggregateOfferThingStorageKeyPrefixDefault);
}

export interface AggregateOfferThingStore extends Store<AggregateOfferThingStoreKey, AggregateOfferThing> {

}

export function getAggregateOfferThingStore() {
    return getLogisticsStore<AggregateOfferThing, typeof AggregateOfferThingStoreKeySymbol>(getLogisticsAggregateOfferThingStorageKeyPrefix, AggregateOfferThingStoreKeySymbol);
}