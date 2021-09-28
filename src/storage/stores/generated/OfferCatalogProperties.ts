import { OfferCatalogProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferCatalogProperties
}

const OfferCatalogPropertiesStoreKeySymbol = Symbol("OfferCatalogPropertiesStoreKey");
export type OfferCatalogPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof OfferCatalogPropertiesStoreKeySymbol>

export function isOfferCatalogPropertiesStoreKey(key: unknown): key is OfferCatalogPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferCatalogPropertiesStorageKeyPrefix());
}

export const LogisticsOfferCatalogPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferCatalogPropertiesPrefix";
export const LogisticsOfferCatalogPropertiesStorageKeyPrefixDefault = "OfferCatalogProperties/";

export function getLogisticsOfferCatalogPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferCatalogPropertiesStorageKeyPrefix, LogisticsOfferCatalogPropertiesStorageKeyPrefixDefault);
}

export interface OfferCatalogPropertiesStore extends Store<OfferCatalogPropertiesStoreKey, OfferCatalogProperties> {

}

export function getOfferCatalogPropertiesStore() {
    return getLogisticsStore<OfferCatalogProperties, typeof OfferCatalogPropertiesStoreKeySymbol>(getLogisticsOfferCatalogPropertiesStorageKeyPrefix, OfferCatalogPropertiesStoreKeySymbol);
}