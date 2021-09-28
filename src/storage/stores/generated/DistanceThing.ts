import { DistanceThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DistanceThing
}

const DistanceThingStoreKeySymbol = Symbol("DistanceThingStoreKey");
export type DistanceThingStoreKey = BrandedStoreKey<StoreKey, typeof DistanceThingStoreKeySymbol>

export function isDistanceThingStoreKey(key: unknown): key is DistanceThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDistanceThingStorageKeyPrefix());
}

export const LogisticsDistanceThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DistanceThingPrefix";
export const LogisticsDistanceThingStorageKeyPrefixDefault = "DistanceThing/";

export function getLogisticsDistanceThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDistanceThingStorageKeyPrefix, LogisticsDistanceThingStorageKeyPrefixDefault);
}

export interface DistanceThingStore extends Store<DistanceThingStoreKey, DistanceThing> {

}

export function getDistanceThingStore() {
    return getLogisticsStore<DistanceThing, typeof DistanceThingStoreKeySymbol>(getLogisticsDistanceThingStorageKeyPrefix, DistanceThingStoreKeySymbol);
}