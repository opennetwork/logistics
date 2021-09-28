import { ContactPointOptionThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ContactPointOptionThing
}

const ContactPointOptionThingStoreKeySymbol = Symbol("ContactPointOptionThingStoreKey");
export type ContactPointOptionThingStoreKey = BrandedStoreKey<StoreKey, typeof ContactPointOptionThingStoreKeySymbol>

export function isContactPointOptionThingStoreKey(key: unknown): key is ContactPointOptionThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsContactPointOptionThingStorageKeyPrefix());
}

export const LogisticsContactPointOptionThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ContactPointOptionThingPrefix";
export const LogisticsContactPointOptionThingStorageKeyPrefixDefault = "ContactPointOptionThing/";

export function getLogisticsContactPointOptionThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsContactPointOptionThingStorageKeyPrefix, LogisticsContactPointOptionThingStorageKeyPrefixDefault);
}

export interface ContactPointOptionThingStore extends Store<ContactPointOptionThingStoreKey, ContactPointOptionThing> {

}

export function getContactPointOptionThingStore() {
    return getLogisticsStore<ContactPointOptionThing, typeof ContactPointOptionThingStoreKeySymbol>(getLogisticsContactPointOptionThingStorageKeyPrefix, ContactPointOptionThingStoreKeySymbol);
}