import { OfferShippingDetails } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferShippingDetails
}

const OfferShippingDetailsStoreKeySymbol = Symbol("OfferShippingDetailsStoreKey");
export type OfferShippingDetailsStoreKey = BrandedStoreKey<StoreKey, typeof OfferShippingDetailsStoreKeySymbol>

export function isOfferShippingDetailsStoreKey(key: unknown): key is OfferShippingDetailsStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferShippingDetailsStorageKeyPrefix());
}

export const LogisticsOfferShippingDetailsStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferShippingDetailsPrefix";
export const LogisticsOfferShippingDetailsStorageKeyPrefixDefault = "OfferShippingDetails/";

export function getLogisticsOfferShippingDetailsStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferShippingDetailsStorageKeyPrefix, LogisticsOfferShippingDetailsStorageKeyPrefixDefault);
}

export interface OfferShippingDetailsStore extends Store<OfferShippingDetailsStoreKey, OfferShippingDetails> {

}

export function getOfferShippingDetailsStore() {
    return getLogisticsStore<OfferShippingDetails, typeof OfferShippingDetailsStoreKeySymbol>(getLogisticsOfferShippingDetailsStorageKeyPrefix, OfferShippingDetailsStoreKeySymbol);
}