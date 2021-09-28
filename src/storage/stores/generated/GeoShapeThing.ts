import { GeoShapeThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    GeoShapeThing
}

const GeoShapeThingStoreKeySymbol = Symbol("GeoShapeThingStoreKey");
export type GeoShapeThingStoreKey = BrandedStoreKey<StoreKey, typeof GeoShapeThingStoreKeySymbol>

export function isGeoShapeThingStoreKey(key: unknown): key is GeoShapeThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsGeoShapeThingStorageKeyPrefix());
}

export const LogisticsGeoShapeThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#GeoShapeThingPrefix";
export const LogisticsGeoShapeThingStorageKeyPrefixDefault = "GeoShapeThing/";

export function getLogisticsGeoShapeThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsGeoShapeThingStorageKeyPrefix, LogisticsGeoShapeThingStorageKeyPrefixDefault);
}

export interface GeoShapeThingStore extends Store<GeoShapeThingStoreKey, GeoShapeThing> {

}

export function getGeoShapeThingStore() {
    return getLogisticsStore<GeoShapeThing, typeof GeoShapeThingStoreKeySymbol>(getLogisticsGeoShapeThingStorageKeyPrefix, GeoShapeThingStoreKeySymbol);
}