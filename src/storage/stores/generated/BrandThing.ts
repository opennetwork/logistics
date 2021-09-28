import { BrandThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    BrandThing
}

const BrandThingStoreKeySymbol = Symbol("BrandThingStoreKey");
export type BrandThingStoreKey = BrandedStoreKey<StoreKey, typeof BrandThingStoreKeySymbol>

export function isBrandThingStoreKey(key: unknown): key is BrandThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsBrandThingStorageKeyPrefix());
}

export const LogisticsBrandThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#BrandThingPrefix";
export const LogisticsBrandThingStorageKeyPrefixDefault = "BrandThing/";

export function getLogisticsBrandThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsBrandThingStorageKeyPrefix, LogisticsBrandThingStorageKeyPrefixDefault);
}

export interface BrandThingStore extends Store<BrandThingStoreKey, BrandThing> {

}

export function getBrandThingStore() {
    return getLogisticsStore<BrandThing, typeof BrandThingStoreKeySymbol>(getLogisticsBrandThingStorageKeyPrefix, BrandThingStoreKeySymbol);
}