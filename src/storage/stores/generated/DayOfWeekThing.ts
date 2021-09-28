import { DayOfWeekThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DayOfWeekThing
}

const DayOfWeekThingStoreKeySymbol = Symbol("DayOfWeekThingStoreKey");
export type DayOfWeekThingStoreKey = BrandedStoreKey<StoreKey, typeof DayOfWeekThingStoreKeySymbol>

export function isDayOfWeekThingStoreKey(key: unknown): key is DayOfWeekThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDayOfWeekThingStorageKeyPrefix());
}

export const LogisticsDayOfWeekThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#DayOfWeekThingPrefix";
export const LogisticsDayOfWeekThingStorageKeyPrefixDefault = "DayOfWeekThing/";

export function getLogisticsDayOfWeekThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDayOfWeekThingStorageKeyPrefix, LogisticsDayOfWeekThingStorageKeyPrefixDefault);
}

export interface DayOfWeekThingStore extends Store<DayOfWeekThingStoreKey, DayOfWeekThing> {

}

export function getDayOfWeekThingStore() {
    return getLogisticsStore<DayOfWeekThing, typeof DayOfWeekThingStoreKeySymbol>(getLogisticsDayOfWeekThingStorageKeyPrefix, DayOfWeekThingStoreKeySymbol);
}