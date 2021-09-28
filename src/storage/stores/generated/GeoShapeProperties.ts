import { GeoShapeProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    GeoShapeProperties
}

const GeoShapePropertiesStoreKeySymbol = Symbol("GeoShapePropertiesStoreKey");
export type GeoShapePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof GeoShapePropertiesStoreKeySymbol>

export function isGeoShapePropertiesStoreKey(key: unknown): key is GeoShapePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsGeoShapePropertiesStorageKeyPrefix());
}

export const LogisticsGeoShapePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#GeoShapePropertiesPrefix";
export const LogisticsGeoShapePropertiesStorageKeyPrefixDefault = "GeoShapeProperties/";

export function getLogisticsGeoShapePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsGeoShapePropertiesStorageKeyPrefix, LogisticsGeoShapePropertiesStorageKeyPrefixDefault);
}

export interface GeoShapePropertiesStore extends Store<GeoShapePropertiesStoreKey, GeoShapeProperties> {

}

export function getGeoShapePropertiesStore() {
    return getLogisticsStore<GeoShapeProperties, typeof GeoShapePropertiesStoreKeySymbol>(getLogisticsGeoShapePropertiesStorageKeyPrefix, GeoShapePropertiesStoreKeySymbol);
}