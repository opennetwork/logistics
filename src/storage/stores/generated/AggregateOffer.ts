import { AggregateOffer } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    AggregateOffer
}

const AggregateOfferStoreKeySymbol = Symbol("AggregateOfferStoreKey");
export type AggregateOfferStoreKey = BrandedStoreKey<StoreKey, typeof AggregateOfferStoreKeySymbol>

export function isAggregateOfferStoreKey(key: unknown): key is AggregateOfferStoreKey {
    return isLogisticsStoreKey(key, getLogisticsAggregateOfferStorageKeyPrefix());
}

export const LogisticsAggregateOfferStorageKeyPrefix = "https://logistics.opennetwork.dev/#AggregateOfferPrefix";
export const LogisticsAggregateOfferStorageKeyPrefixDefault = "AggregateOffer/";

export function getLogisticsAggregateOfferStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsAggregateOfferStorageKeyPrefix, LogisticsAggregateOfferStorageKeyPrefixDefault);
}

export interface AggregateOfferStore extends Store<AggregateOfferStoreKey, AggregateOffer> {

}

export function getAggregateOfferStore() {
    return getLogisticsStore<AggregateOffer, typeof AggregateOfferStoreKeySymbol>(getLogisticsAggregateOfferStorageKeyPrefix, AggregateOfferStoreKeySymbol);
}