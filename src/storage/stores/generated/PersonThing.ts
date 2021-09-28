import { PersonThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PersonThing
}

const PersonThingStoreKeySymbol = Symbol("PersonThingStoreKey");
export type PersonThingStoreKey = BrandedStoreKey<StoreKey, typeof PersonThingStoreKeySymbol>

export function isPersonThingStoreKey(key: unknown): key is PersonThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPersonThingStorageKeyPrefix());
}

export const LogisticsPersonThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#PersonThingPrefix";
export const LogisticsPersonThingStorageKeyPrefixDefault = "PersonThing/";

export function getLogisticsPersonThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPersonThingStorageKeyPrefix, LogisticsPersonThingStorageKeyPrefixDefault);
}

export interface PersonThingStore extends Store<PersonThingStoreKey, PersonThing> {

}

export function getPersonThingStore() {
    return getLogisticsStore<PersonThing, typeof PersonThingStoreKeySymbol>(getLogisticsPersonThingStorageKeyPrefix, PersonThingStoreKeySymbol);
}