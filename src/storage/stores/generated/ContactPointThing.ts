import { ContactPointThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ContactPointThing
}

const ContactPointThingStoreKeySymbol = Symbol("ContactPointThingStoreKey");
export type ContactPointThingStoreKey = BrandedStoreKey<StoreKey, typeof ContactPointThingStoreKeySymbol>

export function isContactPointThingStoreKey(key: unknown): key is ContactPointThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsContactPointThingStorageKeyPrefix());
}

export const LogisticsContactPointThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ContactPointThingPrefix";
export const LogisticsContactPointThingStorageKeyPrefixDefault = "ContactPointThing/";

export function getLogisticsContactPointThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsContactPointThingStorageKeyPrefix, LogisticsContactPointThingStorageKeyPrefixDefault);
}

export interface ContactPointThingStore extends Store<ContactPointThingStoreKey, ContactPointThing> {

}

export function getContactPointThingStore() {
    return getLogisticsStore<ContactPointThing, typeof ContactPointThingStoreKeySymbol>(getLogisticsContactPointThingStorageKeyPrefix, ContactPointThingStoreKeySymbol);
}