import { WarrantyScopeThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    WarrantyScopeThing
}

const WarrantyScopeThingStoreKeySymbol = Symbol("WarrantyScopeThingStoreKey");
export type WarrantyScopeThingStoreKey = BrandedStoreKey<StoreKey, typeof WarrantyScopeThingStoreKeySymbol>

export function isWarrantyScopeThingStoreKey(key: unknown): key is WarrantyScopeThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsWarrantyScopeThingStorageKeyPrefix());
}

export const LogisticsWarrantyScopeThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#WarrantyScopeThingPrefix";
export const LogisticsWarrantyScopeThingStorageKeyPrefixDefault = "WarrantyScopeThing/";

export function getLogisticsWarrantyScopeThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsWarrantyScopeThingStorageKeyPrefix, LogisticsWarrantyScopeThingStorageKeyPrefixDefault);
}

export interface WarrantyScopeThingStore extends Store<WarrantyScopeThingStoreKey, WarrantyScopeThing> {

}

export function getWarrantyScopeThingStore() {
    return getLogisticsStore<WarrantyScopeThing, typeof WarrantyScopeThingStoreKeySymbol>(getLogisticsWarrantyScopeThingStorageKeyPrefix, WarrantyScopeThingStoreKeySymbol);
}