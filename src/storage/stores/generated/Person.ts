import { Person } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Person
}

const PersonStoreKeySymbol = Symbol("PersonStoreKey");
export type PersonStoreKey = BrandedStoreKey<StoreKey, typeof PersonStoreKeySymbol>

export function isPersonStoreKey(key: unknown): key is PersonStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPersonStorageKeyPrefix());
}

export const LogisticsPersonStorageKeyPrefix = "https://logistics.opennetwork.dev/#PersonPrefix";
export const LogisticsPersonStorageKeyPrefixDefault = "Person/";

export function getLogisticsPersonStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPersonStorageKeyPrefix, LogisticsPersonStorageKeyPrefixDefault);
}

export interface PersonStore extends Store<PersonStoreKey, Person> {

}

export function getPersonStore() {
    return getLogisticsStore<Person, typeof PersonStoreKeySymbol>(getLogisticsPersonStorageKeyPrefix, PersonStoreKeySymbol);
}