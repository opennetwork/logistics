import { ImageObject } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ImageObject
}

const ImageObjectStoreKeySymbol = Symbol("ImageObjectStoreKey");
export type ImageObjectStoreKey = BrandedStoreKey<StoreKey, typeof ImageObjectStoreKeySymbol>

export function isImageObjectStoreKey(key: unknown): key is ImageObjectStoreKey {
    return isLogisticsStoreKey(key, getLogisticsImageObjectStorageKeyPrefix());
}

export const LogisticsImageObjectStorageKeyPrefix = "https://logistics.opennetwork.dev/#ImageObjectPrefix";
export const LogisticsImageObjectStorageKeyPrefixDefault = "ImageObject/";

export function getLogisticsImageObjectStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsImageObjectStorageKeyPrefix, LogisticsImageObjectStorageKeyPrefixDefault);
}

export interface ImageObjectStore extends Store<ImageObjectStoreKey, ImageObject> {

}

export function getImageObjectStore() {
    return getLogisticsStore<ImageObject, typeof ImageObjectStoreKeySymbol>(getLogisticsImageObjectStorageKeyPrefix, ImageObjectStoreKeySymbol);
}