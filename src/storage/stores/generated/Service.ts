import { Service } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Service
}

const ServiceStoreKeySymbol = Symbol("ServiceStoreKey");
export type ServiceStoreKey = BrandedStoreKey<StoreKey, typeof ServiceStoreKeySymbol>

export function isServiceStoreKey(key: unknown): key is ServiceStoreKey {
    return isLogisticsStoreKey(key, getLogisticsServiceStorageKeyPrefix());
}

export const LogisticsServiceStorageKeyPrefix = "https://logistics.opennetwork.dev/#ServicePrefix";
export const LogisticsServiceStorageKeyPrefixDefault = "Service/";

export function getLogisticsServiceStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsServiceStorageKeyPrefix, LogisticsServiceStorageKeyPrefixDefault);
}

export interface ServiceStore extends Store<ServiceStoreKey, Service> {

}

export function getServiceStore() {
    return getLogisticsStore<Service, typeof ServiceStoreKeySymbol>(getLogisticsServiceStorageKeyPrefix, ServiceStoreKeySymbol);
}