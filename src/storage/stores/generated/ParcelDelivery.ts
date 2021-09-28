import { ParcelDelivery } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ParcelDelivery
}

const ParcelDeliveryStoreKeySymbol = Symbol("ParcelDeliveryStoreKey");
export type ParcelDeliveryStoreKey = BrandedStoreKey<StoreKey, typeof ParcelDeliveryStoreKeySymbol>

export function isParcelDeliveryStoreKey(key: unknown): key is ParcelDeliveryStoreKey {
    return isLogisticsStoreKey(key, getLogisticsParcelDeliveryStorageKeyPrefix());
}

export const LogisticsParcelDeliveryStorageKeyPrefix = "https://logistics.opennetwork.dev/#ParcelDeliveryPrefix";
export const LogisticsParcelDeliveryStorageKeyPrefixDefault = "ParcelDelivery/";

export function getLogisticsParcelDeliveryStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsParcelDeliveryStorageKeyPrefix, LogisticsParcelDeliveryStorageKeyPrefixDefault);
}

export interface ParcelDeliveryStore extends Store<ParcelDeliveryStoreKey, ParcelDelivery> {

}

export function getParcelDeliveryStore() {
    return getLogisticsStore<ParcelDelivery, typeof ParcelDeliveryStoreKeySymbol>(getLogisticsParcelDeliveryStorageKeyPrefix, ParcelDeliveryStoreKeySymbol);
}