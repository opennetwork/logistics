import { OfferCatalog } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferCatalog
}

const OfferCatalogStoreKeySymbol = Symbol("OfferCatalogStoreKey");
export type OfferCatalogStoreKey = BrandedStoreKey<StoreKey, typeof OfferCatalogStoreKeySymbol>

export function isOfferCatalogStoreKey(key: unknown): key is OfferCatalogStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferCatalogStorageKeyPrefix());
}

export const LogisticsOfferCatalogStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferCatalogPrefix";
export const LogisticsOfferCatalogStorageKeyPrefixDefault = "OfferCatalog/";

export function getLogisticsOfferCatalogStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferCatalogStorageKeyPrefix, LogisticsOfferCatalogStorageKeyPrefixDefault);
}

export interface OfferCatalogStore extends Store<OfferCatalogStoreKey, OfferCatalog> {

}

export function getOfferCatalogStore() {
    return getLogisticsStore<OfferCatalog, typeof OfferCatalogStoreKeySymbol>(getLogisticsOfferCatalogStorageKeyPrefix, OfferCatalogStoreKeySymbol);
}