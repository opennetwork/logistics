import { OfferCatalogThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferCatalogThing
}

const OfferCatalogThingStoreKeySymbol = Symbol("OfferCatalogThingStoreKey");
export type OfferCatalogThingStoreKey = BrandedStoreKey<StoreKey, typeof OfferCatalogThingStoreKeySymbol>

export function isOfferCatalogThingStoreKey(key: unknown): key is OfferCatalogThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferCatalogThingStorageKeyPrefix());
}

export const LogisticsOfferCatalogThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferCatalogThingPrefix";
export const LogisticsOfferCatalogThingStorageKeyPrefixDefault = "OfferCatalogThing/";

export function getLogisticsOfferCatalogThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferCatalogThingStorageKeyPrefix, LogisticsOfferCatalogThingStorageKeyPrefixDefault);
}

export interface OfferCatalogThingStore extends Store<OfferCatalogThingStoreKey, OfferCatalogThing> {

}

export function getOfferCatalogThingStore() {
    return getLogisticsStore<OfferCatalogThing, typeof OfferCatalogThingStoreKeySymbol>(getLogisticsOfferCatalogThingStorageKeyPrefix, OfferCatalogThingStoreKeySymbol);
}