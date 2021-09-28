import { PostalAddress } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PostalAddress
}

const PostalAddressStoreKeySymbol = Symbol("PostalAddressStoreKey");
export type PostalAddressStoreKey = BrandedStoreKey<StoreKey, typeof PostalAddressStoreKeySymbol>

export function isPostalAddressStoreKey(key: unknown): key is PostalAddressStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPostalAddressStorageKeyPrefix());
}

export const LogisticsPostalAddressStorageKeyPrefix = "https://logistics.opennetwork.dev/#PostalAddressPrefix";
export const LogisticsPostalAddressStorageKeyPrefixDefault = "PostalAddress/";

export function getLogisticsPostalAddressStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPostalAddressStorageKeyPrefix, LogisticsPostalAddressStorageKeyPrefixDefault);
}

export interface PostalAddressStore extends Store<PostalAddressStoreKey, PostalAddress> {

}

export function getPostalAddressStore() {
    return getLogisticsStore<PostalAddress, typeof PostalAddressStoreKeySymbol>(getLogisticsPostalAddressStorageKeyPrefix, PostalAddressStoreKeySymbol);
}