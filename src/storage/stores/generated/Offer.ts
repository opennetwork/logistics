import { Offer } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Offer
}

const OfferStoreKeySymbol = Symbol("OfferStoreKey");
export type OfferStoreKey = BrandedStoreKey<StoreKey, typeof OfferStoreKeySymbol>

export function isOfferStoreKey(key: unknown): key is OfferStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferStorageKeyPrefix());
}

export const LogisticsOfferStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferPrefix";
export const LogisticsOfferStorageKeyPrefixDefault = "Offer/";

export function getLogisticsOfferStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferStorageKeyPrefix, LogisticsOfferStorageKeyPrefixDefault);
}

export interface OfferStore extends Store<OfferStoreKey, Offer> {

}

export function getOfferStore() {
    return getLogisticsStore<Offer, typeof OfferStoreKeySymbol>(getLogisticsOfferStorageKeyPrefix, OfferStoreKeySymbol);
}