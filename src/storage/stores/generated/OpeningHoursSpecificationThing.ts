import { OpeningHoursSpecificationThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OpeningHoursSpecificationThing
}

const OpeningHoursSpecificationThingStoreKeySymbol = Symbol("OpeningHoursSpecificationThingStoreKey");
export type OpeningHoursSpecificationThingStoreKey = BrandedStoreKey<StoreKey, typeof OpeningHoursSpecificationThingStoreKeySymbol>

export function isOpeningHoursSpecificationThingStoreKey(key: unknown): key is OpeningHoursSpecificationThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOpeningHoursSpecificationThingStorageKeyPrefix());
}

export const LogisticsOpeningHoursSpecificationThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OpeningHoursSpecificationThingPrefix";
export const LogisticsOpeningHoursSpecificationThingStorageKeyPrefixDefault = "OpeningHoursSpecificationThing/";

export function getLogisticsOpeningHoursSpecificationThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOpeningHoursSpecificationThingStorageKeyPrefix, LogisticsOpeningHoursSpecificationThingStorageKeyPrefixDefault);
}

export interface OpeningHoursSpecificationThingStore extends Store<OpeningHoursSpecificationThingStoreKey, OpeningHoursSpecificationThing> {

}

export function getOpeningHoursSpecificationThingStore() {
    return getLogisticsStore<OpeningHoursSpecificationThing, typeof OpeningHoursSpecificationThingStoreKeySymbol>(getLogisticsOpeningHoursSpecificationThingStorageKeyPrefix, OpeningHoursSpecificationThingStoreKeySymbol);
}