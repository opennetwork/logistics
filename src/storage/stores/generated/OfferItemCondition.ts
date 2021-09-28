import { OfferItemCondition } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OfferItemCondition
}

const OfferItemConditionStoreKeySymbol = Symbol("OfferItemConditionStoreKey");
export type OfferItemConditionStoreKey = BrandedStoreKey<StoreKey, typeof OfferItemConditionStoreKeySymbol>

export function isOfferItemConditionStoreKey(key: unknown): key is OfferItemConditionStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOfferItemConditionStorageKeyPrefix());
}

export const LogisticsOfferItemConditionStorageKeyPrefix = "https://logistics.opennetwork.dev/#OfferItemConditionPrefix";
export const LogisticsOfferItemConditionStorageKeyPrefixDefault = "OfferItemCondition/";

export function getLogisticsOfferItemConditionStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOfferItemConditionStorageKeyPrefix, LogisticsOfferItemConditionStorageKeyPrefixDefault);
}

export interface OfferItemConditionStore extends Store<OfferItemConditionStoreKey, OfferItemCondition> {

}

export function getOfferItemConditionStore() {
    return getLogisticsStore<OfferItemCondition, typeof OfferItemConditionStoreKeySymbol>(getLogisticsOfferItemConditionStorageKeyPrefix, OfferItemConditionStoreKeySymbol);
}