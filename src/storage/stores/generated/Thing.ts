import { Thing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Thing
}

const ThingStoreKeySymbol = Symbol("ThingStoreKey");
export type ThingStoreKey = BrandedStoreKey<StoreKey, typeof ThingStoreKeySymbol>

export function isThingStoreKey(key: unknown): key is ThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsThingStorageKeyPrefix());
}

export const LogisticsThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ThingPrefix";
export const LogisticsThingStorageKeyPrefixDefault = "Thing/";

export function getLogisticsThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsThingStorageKeyPrefix, LogisticsThingStorageKeyPrefixDefault);
}

export interface ThingStore extends Store<ThingStoreKey, Thing> {

}

export function getThingStore() {
    return getLogisticsStore<Thing, typeof ThingStoreKeySymbol>(getLogisticsThingStorageKeyPrefix, ThingStoreKeySymbol);
}