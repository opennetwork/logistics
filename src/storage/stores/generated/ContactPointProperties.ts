import { ContactPointProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ContactPointProperties
}

const ContactPointPropertiesStoreKeySymbol = Symbol("ContactPointPropertiesStoreKey");
export type ContactPointPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ContactPointPropertiesStoreKeySymbol>

export function isContactPointPropertiesStoreKey(key: unknown): key is ContactPointPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsContactPointPropertiesStorageKeyPrefix());
}

export const LogisticsContactPointPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ContactPointPropertiesPrefix";
export const LogisticsContactPointPropertiesStorageKeyPrefixDefault = "ContactPointProperties/";

export function getLogisticsContactPointPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsContactPointPropertiesStorageKeyPrefix, LogisticsContactPointPropertiesStorageKeyPrefixDefault);
}

export interface ContactPointPropertiesStore extends Store<ContactPointPropertiesStoreKey, ContactPointProperties> {

}

export function getContactPointPropertiesStore() {
    return getLogisticsStore<ContactPointProperties, typeof ContactPointPropertiesStoreKeySymbol>(getLogisticsContactPointPropertiesStorageKeyPrefix, ContactPointPropertiesStoreKeySymbol);
}