import { ServiceThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ServiceThing
}

const ServiceThingStoreKeySymbol = Symbol("ServiceThingStoreKey");
export type ServiceThingStoreKey = BrandedStoreKey<StoreKey, typeof ServiceThingStoreKeySymbol>

export function isServiceThingStoreKey(key: unknown): key is ServiceThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsServiceThingStorageKeyPrefix());
}

export const LogisticsServiceThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ServiceThingPrefix";
export const LogisticsServiceThingStorageKeyPrefixDefault = "ServiceThing/";

export function getLogisticsServiceThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsServiceThingStorageKeyPrefix, LogisticsServiceThingStorageKeyPrefixDefault);
}

export interface ServiceThingStore extends Store<ServiceThingStoreKey, ServiceThing> {

}

export function getServiceThingStore() {
    return getLogisticsStore<ServiceThing, typeof ServiceThingStoreKeySymbol>(getLogisticsServiceThingStorageKeyPrefix, ServiceThingStoreKeySymbol);
}