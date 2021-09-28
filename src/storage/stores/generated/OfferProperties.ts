import { OfferProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferProperties
}

const OfferPropertiesStoreKeySymbol = Symbol("OfferPropertiesStoreKey");
export type OfferPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof OfferPropertiesStoreKeySymbol>

export function isOfferPropertiesStoreKey(key: unknown): key is OfferPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferPropertiesStorageKeyPrefix());
}

export const LogisticsOfferPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferPropertiesPrefix";
export const LogisticsOfferPropertiesStorageKeyPrefixDefault = "OfferProperties/";

export function getLogisticsOfferPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferPropertiesStorageKeyPrefix, LogisticsOfferPropertiesStorageKeyPrefixDefault);
}

export interface OfferPropertiesStore extends Store<OfferPropertiesStoreKey, OfferProperties> {

}

export function getOfferPropertiesStore() {
    return getLogisticsStore<OfferProperties, typeof OfferPropertiesStoreKeySymbol>(getLogisticsOfferPropertiesStorageKeyPrefix, OfferPropertiesStoreKeySymbol);
}