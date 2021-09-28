import { Distance } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Distance
}

const DistanceStoreKeySymbol = Symbol("DistanceStoreKey");
export type DistanceStoreKey = BrandedStoreKey<StoreKey, typeof DistanceStoreKeySymbol>

export function isDistanceStoreKey(key: unknown): key is DistanceStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDistanceStorageKeyPrefix());
}

export const LogisticsDistanceStorageKeyPrefix = "https://logistics.opennetwork.dev/#DistancePrefix";
export const LogisticsDistanceStorageKeyPrefixDefault = "Distance/";

export function getLogisticsDistanceStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDistanceStorageKeyPrefix, LogisticsDistanceStorageKeyPrefixDefault);
}

export interface DistanceStore extends Store<DistanceStoreKey, Distance> {

}

export function getDistanceStore() {
    return getLogisticsStore<Distance, typeof DistanceStoreKeySymbol>(getLogisticsDistanceStorageKeyPrefix, DistanceStoreKeySymbol);
}