import { ImageObjectProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ImageObjectProperties
}

const ImageObjectPropertiesStoreKeySymbol = Symbol("ImageObjectPropertiesStoreKey");
export type ImageObjectPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ImageObjectPropertiesStoreKeySymbol>

export function isImageObjectPropertiesStoreKey(key: unknown): key is ImageObjectPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsImageObjectPropertiesStorageKeyPrefix());
}

export const LogisticsImageObjectPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ImageObjectPropertiesPrefix";
export const LogisticsImageObjectPropertiesStorageKeyPrefixDefault = "ImageObjectProperties/";

export function getLogisticsImageObjectPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsImageObjectPropertiesStorageKeyPrefix, LogisticsImageObjectPropertiesStorageKeyPrefixDefault);
}

export interface ImageObjectPropertiesStore extends Store<ImageObjectPropertiesStoreKey, ImageObjectProperties> {

}

export function getImageObjectPropertiesStore() {
    return getLogisticsStore<ImageObjectProperties, typeof ImageObjectPropertiesStoreKeySymbol>(getLogisticsImageObjectPropertiesStorageKeyPrefix, ImageObjectPropertiesStoreKeySymbol);
}