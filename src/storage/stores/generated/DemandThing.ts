import { DemandThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DemandThing
}

const DemandThingStoreKeySymbol = Symbol("DemandThingStoreKey");
export type DemandThingStoreKey = BrandedStoreKey<StoreKey, typeof DemandThingStoreKeySymbol>

export function isDemandThingStoreKey(key: unknown): key is DemandThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDemandThingStorageKeyPrefix());
}

export const LogisticsDemandThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DemandThingPrefix";
export const LogisticsDemandThingStorageKeyPrefixDefault = "DemandThing/";

export function getLogisticsDemandThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDemandThingStorageKeyPrefix, LogisticsDemandThingStorageKeyPrefixDefault);
}

export interface DemandThingStore extends Store<DemandThingStoreKey, DemandThing> {

}

export function getDemandThingStore() {
    return getLogisticsStore<DemandThing, typeof DemandThingStoreKeySymbol>(getLogisticsDemandThingStorageKeyPrefix, DemandThingStoreKeySymbol);
}