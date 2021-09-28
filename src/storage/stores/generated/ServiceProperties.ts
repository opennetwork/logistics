import { ServiceProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ServiceProperties
}

const ServicePropertiesStoreKeySymbol = Symbol("ServicePropertiesStoreKey");
export type ServicePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ServicePropertiesStoreKeySymbol>

export function isServicePropertiesStoreKey(key: unknown): key is ServicePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsServicePropertiesStorageKeyPrefix());
}

export const LogisticsServicePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ServicePropertiesPrefix";
export const LogisticsServicePropertiesStorageKeyPrefixDefault = "ServiceProperties/";

export function getLogisticsServicePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsServicePropertiesStorageKeyPrefix, LogisticsServicePropertiesStorageKeyPrefixDefault);
}

export interface ServicePropertiesStore extends Store<ServicePropertiesStoreKey, ServiceProperties> {

}

export function getServicePropertiesStore() {
    return getLogisticsStore<ServiceProperties, typeof ServicePropertiesStoreKeySymbol>(getLogisticsServicePropertiesStorageKeyPrefix, ServicePropertiesStoreKeySymbol);
}