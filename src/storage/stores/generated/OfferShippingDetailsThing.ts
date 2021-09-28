import { OfferShippingDetailsThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferShippingDetailsThing
}

const OfferShippingDetailsThingStoreKeySymbol = Symbol("OfferShippingDetailsThingStoreKey");
export type OfferShippingDetailsThingStoreKey = BrandedStoreKey<StoreKey, typeof OfferShippingDetailsThingStoreKeySymbol>

export function isOfferShippingDetailsThingStoreKey(key: unknown): key is OfferShippingDetailsThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferShippingDetailsThingStorageKeyPrefix());
}

export const LogisticsOfferShippingDetailsThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferShippingDetailsThingPrefix";
export const LogisticsOfferShippingDetailsThingStorageKeyPrefixDefault = "OfferShippingDetailsThing/";

export function getLogisticsOfferShippingDetailsThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferShippingDetailsThingStorageKeyPrefix, LogisticsOfferShippingDetailsThingStorageKeyPrefixDefault);
}

export interface OfferShippingDetailsThingStore extends Store<OfferShippingDetailsThingStoreKey, OfferShippingDetailsThing> {

}

export function getOfferShippingDetailsThingStore() {
    return getLogisticsStore<OfferShippingDetailsThing, typeof OfferShippingDetailsThingStoreKeySymbol>(getLogisticsOfferShippingDetailsThingStorageKeyPrefix, OfferShippingDetailsThingStoreKeySymbol);
}