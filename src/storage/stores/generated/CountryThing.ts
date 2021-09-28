import { CountryThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    CountryThing
}

const CountryThingStoreKeySymbol = Symbol("CountryThingStoreKey");
export type CountryThingStoreKey = BrandedStoreKey<StoreKey, typeof CountryThingStoreKeySymbol>

export function isCountryThingStoreKey(key: unknown): key is CountryThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsCountryThingStorageKeyPrefix());
}

export const LogisticsCountryThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#CountryThingPrefix";
export const LogisticsCountryThingStorageKeyPrefixDefault = "CountryThing/";

export function getLogisticsCountryThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsCountryThingStorageKeyPrefix, LogisticsCountryThingStorageKeyPrefixDefault);
}

export interface CountryThingStore extends Store<CountryThingStoreKey, CountryThing> {

}

export function getCountryThingStore() {
    return getLogisticsStore<CountryThing, typeof CountryThingStoreKeySymbol>(getLogisticsCountryThingStorageKeyPrefix, CountryThingStoreKeySymbol);
}