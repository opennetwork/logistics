import { ParcelDeliveryThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ParcelDeliveryThing
}

const ParcelDeliveryThingStoreKeySymbol = Symbol("ParcelDeliveryThingStoreKey");
export type ParcelDeliveryThingStoreKey = BrandedStoreKey<StoreKey, typeof ParcelDeliveryThingStoreKeySymbol>

export function isParcelDeliveryThingStoreKey(key: unknown): key is ParcelDeliveryThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsParcelDeliveryThingStorageKeyPrefix());
}

export const LogisticsParcelDeliveryThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ParcelDeliveryThingPrefix";
export const LogisticsParcelDeliveryThingStorageKeyPrefixDefault = "ParcelDeliveryThing/";

export function getLogisticsParcelDeliveryThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsParcelDeliveryThingStorageKeyPrefix, LogisticsParcelDeliveryThingStorageKeyPrefixDefault);
}

export interface ParcelDeliveryThingStore extends Store<ParcelDeliveryThingStoreKey, ParcelDeliveryThing> {

}

export function getParcelDeliveryThingStore() {
    return getLogisticsStore<ParcelDeliveryThing, typeof ParcelDeliveryThingStoreKeySymbol>(getLogisticsParcelDeliveryThingStorageKeyPrefix, ParcelDeliveryThingStoreKeySymbol);
}