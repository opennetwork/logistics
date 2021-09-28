import { ContactPoint } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ContactPoint
}

const ContactPointStoreKeySymbol = Symbol("ContactPointStoreKey");
export type ContactPointStoreKey = BrandedStoreKey<StoreKey, typeof ContactPointStoreKeySymbol>

export function isContactPointStoreKey(key: unknown): key is ContactPointStoreKey {
    return isLogisticsStoreKey(key, getLogisticsContactPointStorageKeyPrefix());
}

export const LogisticsContactPointStorageKeyPrefix = "https://logistics.opennetwork.dev/#ContactPointPrefix";
export const LogisticsContactPointStorageKeyPrefixDefault = "ContactPoint/";

export function getLogisticsContactPointStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsContactPointStorageKeyPrefix, LogisticsContactPointStorageKeyPrefixDefault);
}

export interface ContactPointStore extends Store<ContactPointStoreKey, ContactPoint> {

}

export function getContactPointStore() {
    return getLogisticsStore<ContactPoint, typeof ContactPointStoreKeySymbol>(getLogisticsContactPointStorageKeyPrefix, ContactPointStoreKeySymbol);
}