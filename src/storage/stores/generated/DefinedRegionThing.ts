import { DefinedRegionThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DefinedRegionThing
}

const DefinedRegionThingStoreKeySymbol = Symbol("DefinedRegionThingStoreKey");
export type DefinedRegionThingStoreKey = BrandedStoreKey<StoreKey, typeof DefinedRegionThingStoreKeySymbol>

export function isDefinedRegionThingStoreKey(key: unknown): key is DefinedRegionThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDefinedRegionThingStorageKeyPrefix());
}

export const LogisticsDefinedRegionThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DefinedRegionThingPrefix";
export const LogisticsDefinedRegionThingStorageKeyPrefixDefault = "DefinedRegionThing/";

export function getLogisticsDefinedRegionThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDefinedRegionThingStorageKeyPrefix, LogisticsDefinedRegionThingStorageKeyPrefixDefault);
}

export interface DefinedRegionThingStore extends Store<DefinedRegionThingStoreKey, DefinedRegionThing> {

}

export function getDefinedRegionThingStore() {
    return getLogisticsStore<DefinedRegionThing, typeof DefinedRegionThingStoreKeySymbol>(getLogisticsDefinedRegionThingStorageKeyPrefix, DefinedRegionThingStoreKeySymbol);
}