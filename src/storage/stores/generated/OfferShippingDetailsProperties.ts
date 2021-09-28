import { OfferShippingDetailsProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferShippingDetailsProperties
}

const OfferShippingDetailsPropertiesStoreKeySymbol = Symbol("OfferShippingDetailsPropertiesStoreKey");
export type OfferShippingDetailsPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof OfferShippingDetailsPropertiesStoreKeySymbol>

export function isOfferShippingDetailsPropertiesStoreKey(key: unknown): key is OfferShippingDetailsPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferShippingDetailsPropertiesStorageKeyPrefix());
}

export const LogisticsOfferShippingDetailsPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferShippingDetailsPropertiesPrefix";
export const LogisticsOfferShippingDetailsPropertiesStorageKeyPrefixDefault = "OfferShippingDetailsProperties/";

export function getLogisticsOfferShippingDetailsPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferShippingDetailsPropertiesStorageKeyPrefix, LogisticsOfferShippingDetailsPropertiesStorageKeyPrefixDefault);
}

export interface OfferShippingDetailsPropertiesStore extends Store<OfferShippingDetailsPropertiesStoreKey, OfferShippingDetailsProperties> {

}

export function getOfferShippingDetailsPropertiesStore() {
    return getLogisticsStore<OfferShippingDetailsProperties, typeof OfferShippingDetailsPropertiesStoreKeySymbol>(getLogisticsOfferShippingDetailsPropertiesStorageKeyPrefix, OfferShippingDetailsPropertiesStoreKeySymbol);
}