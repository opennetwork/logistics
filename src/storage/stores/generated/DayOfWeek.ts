import { DayOfWeek } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DayOfWeek
}

const DayOfWeekStoreKeySymbol = Symbol("DayOfWeekStoreKey");
export type DayOfWeekStoreKey = BrandedStoreKey<StoreKey, typeof DayOfWeekStoreKeySymbol>

export function isDayOfWeekStoreKey(key: unknown): key is DayOfWeekStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDayOfWeekStorageKeyPrefix());
}

export const LogisticsDayOfWeekStorageKeyPrefix = "https://logistics.opennetwork.dev/#DayOfWeekPrefix";
export const LogisticsDayOfWeekStorageKeyPrefixDefault = "DayOfWeek/";

export function getLogisticsDayOfWeekStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDayOfWeekStorageKeyPrefix, LogisticsDayOfWeekStorageKeyPrefixDefault);
}

export interface DayOfWeekStore extends Store<DayOfWeekStoreKey, DayOfWeek> {

}

export function getDayOfWeekStore() {
    return getLogisticsStore<DayOfWeek, typeof DayOfWeekStoreKeySymbol>(getLogisticsDayOfWeekStorageKeyPrefix, DayOfWeekStoreKeySymbol);
}