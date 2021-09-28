import { ImageObjectThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ImageObjectThing
}

const ImageObjectThingStoreKeySymbol = Symbol("ImageObjectThingStoreKey");
export type ImageObjectThingStoreKey = BrandedStoreKey<StoreKey, typeof ImageObjectThingStoreKeySymbol>

export function isImageObjectThingStoreKey(key: unknown): key is ImageObjectThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsImageObjectThingStorageKeyPrefix());
}

export const LogisticsImageObjectThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ImageObjectThingPrefix";
export const LogisticsImageObjectThingStorageKeyPrefixDefault = "ImageObjectThing/";

export function getLogisticsImageObjectThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsImageObjectThingStorageKeyPrefix, LogisticsImageObjectThingStorageKeyPrefixDefault);
}

export interface ImageObjectThingStore extends Store<ImageObjectThingStoreKey, ImageObjectThing> {

}

export function getImageObjectThingStore() {
    return getLogisticsStore<ImageObjectThing, typeof ImageObjectThingStoreKeySymbol>(getLogisticsImageObjectThingStorageKeyPrefix, ImageObjectThingStoreKeySymbol);
}