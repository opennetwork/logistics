import { Country } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Country
}

const CountryStoreKeySymbol = Symbol("CountryStoreKey");
export type CountryStoreKey = BrandedStoreKey<StoreKey, typeof CountryStoreKeySymbol>

export function isCountryStoreKey(key: unknown): key is CountryStoreKey {
    return isLogisticsStoreKey(key, getLogisticsCountryStorageKeyPrefix());
}

export const LogisticsCountryStorageKeyPrefix = "https://logistics.opennetwork.dev/#CountryPrefix";
export const LogisticsCountryStorageKeyPrefixDefault = "Country/";

export function getLogisticsCountryStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsCountryStorageKeyPrefix, LogisticsCountryStorageKeyPrefixDefault);
}

export interface CountryStore extends Store<CountryStoreKey, Country> {

}

export function getCountryStore() {
    return getLogisticsStore<Country, typeof CountryStoreKeySymbol>(getLogisticsCountryStorageKeyPrefix, CountryStoreKeySymbol);
}