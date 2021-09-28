import { DeliveryMethod } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DeliveryMethod
}

const DeliveryMethodStoreKeySymbol = Symbol("DeliveryMethodStoreKey");
export type DeliveryMethodStoreKey = BrandedStoreKey<StoreKey, typeof DeliveryMethodStoreKeySymbol>

export function isDeliveryMethodStoreKey(key: unknown): key is DeliveryMethodStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDeliveryMethodStorageKeyPrefix());
}

export const LogisticsDeliveryMethodStorageKeyPrefix = "https://logistics.opennetwork.dev/#DeliveryMethodPrefix";
export const LogisticsDeliveryMethodStorageKeyPrefixDefault = "DeliveryMethod/";

export function getLogisticsDeliveryMethodStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDeliveryMethodStorageKeyPrefix, LogisticsDeliveryMethodStorageKeyPrefixDefault);
}

export interface DeliveryMethodStore extends Store<DeliveryMethodStoreKey, DeliveryMethod> {

}

export function getDeliveryMethodStore() {
    return getLogisticsStore<DeliveryMethod, typeof DeliveryMethodStoreKeySymbol>(getLogisticsDeliveryMethodStorageKeyPrefix, DeliveryMethodStoreKeySymbol);
}