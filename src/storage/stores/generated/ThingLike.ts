import { ThingLike } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ThingLike
}

const ThingLikeStoreKeySymbol = Symbol("ThingLikeStoreKey");
export type ThingLikeStoreKey = BrandedStoreKey<StoreKey, typeof ThingLikeStoreKeySymbol>

export function isThingLikeStoreKey(key: unknown): key is ThingLikeStoreKey {
    return isLogisticsStoreKey(key, getLogisticsThingLikeStorageKeyPrefix());
}

export const LogisticsThingLikeStorageKeyPrefix = "https://logistics.opennetwork.dev/#ThingLikePrefix";
export const LogisticsThingLikeStorageKeyPrefixDefault = "ThingLike/";

export function getLogisticsThingLikeStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsThingLikeStorageKeyPrefix, LogisticsThingLikeStorageKeyPrefixDefault);
}

export interface ThingLikeStore extends Store<ThingLikeStoreKey, ThingLike> {

}

export function getThingLikeStore() {
    return getLogisticsStore<ThingLike, typeof ThingLikeStoreKeySymbol>(getLogisticsThingLikeStorageKeyPrefix, ThingLikeStoreKeySymbol);
}