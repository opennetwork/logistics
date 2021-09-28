import { GeoShape } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    GeoShape
}

const GeoShapeStoreKeySymbol = Symbol("GeoShapeStoreKey");
export type GeoShapeStoreKey = BrandedStoreKey<StoreKey, typeof GeoShapeStoreKeySymbol>

export function isGeoShapeStoreKey(key: unknown): key is GeoShapeStoreKey {
    return isLogisticsStoreKey(key, getLogisticsGeoShapeStorageKeyPrefix());
}

export const LogisticsGeoShapeStorageKeyPrefix = "https://logistics.opennetwork.dev/#GeoShapePrefix";
export const LogisticsGeoShapeStorageKeyPrefixDefault = "GeoShape/";

export function getLogisticsGeoShapeStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsGeoShapeStorageKeyPrefix, LogisticsGeoShapeStorageKeyPrefixDefault);
}

export interface GeoShapeStore extends Store<GeoShapeStoreKey, GeoShape> {

}

export function getGeoShapeStore() {
    return getLogisticsStore<GeoShape, typeof GeoShapeStoreKeySymbol>(getLogisticsGeoShapeStorageKeyPrefix, GeoShapeStoreKeySymbol);
}