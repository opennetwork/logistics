import { ContactPointOption } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ContactPointOption
}

const ContactPointOptionStoreKeySymbol = Symbol("ContactPointOptionStoreKey");
export type ContactPointOptionStoreKey = BrandedStoreKey<StoreKey, typeof ContactPointOptionStoreKeySymbol>

export function isContactPointOptionStoreKey(key: unknown): key is ContactPointOptionStoreKey {
    return isLogisticsStoreKey(key, getLogisticsContactPointOptionStorageKeyPrefix());
}

export const LogisticsContactPointOptionStorageKeyPrefix = "https://logistics.opennetwork.dev/#ContactPointOptionPrefix";
export const LogisticsContactPointOptionStorageKeyPrefixDefault = "ContactPointOption/";

export function getLogisticsContactPointOptionStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsContactPointOptionStorageKeyPrefix, LogisticsContactPointOptionStorageKeyPrefixDefault);
}

export interface ContactPointOptionStore extends Store<ContactPointOptionStoreKey, ContactPointOption> {

}

export function getContactPointOptionStore() {
    return getLogisticsStore<ContactPointOption, typeof ContactPointOptionStoreKeySymbol>(getLogisticsContactPointOptionStorageKeyPrefix, ContactPointOptionStoreKeySymbol);
}