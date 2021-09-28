import { PostalAddressThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PostalAddressThing
}

const PostalAddressThingStoreKeySymbol = Symbol("PostalAddressThingStoreKey");
export type PostalAddressThingStoreKey = BrandedStoreKey<StoreKey, typeof PostalAddressThingStoreKeySymbol>

export function isPostalAddressThingStoreKey(key: unknown): key is PostalAddressThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPostalAddressThingStorageKeyPrefix());
}

export const LogisticsPostalAddressThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#PostalAddressThingPrefix";
export const LogisticsPostalAddressThingStorageKeyPrefixDefault = "PostalAddressThing/";

export function getLogisticsPostalAddressThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPostalAddressThingStorageKeyPrefix, LogisticsPostalAddressThingStorageKeyPrefixDefault);
}

export interface PostalAddressThingStore extends Store<PostalAddressThingStoreKey, PostalAddressThing> {

}

export function getPostalAddressThingStore() {
    return getLogisticsStore<PostalAddressThing, typeof PostalAddressThingStoreKeySymbol>(getLogisticsPostalAddressThingStorageKeyPrefix, PostalAddressThingStoreKeySymbol);
}