import { QuantitativeValueThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    QuantitativeValueThing
}

const QuantitativeValueThingStoreKeySymbol = Symbol("QuantitativeValueThingStoreKey");
export type QuantitativeValueThingStoreKey = BrandedStoreKey<StoreKey, typeof QuantitativeValueThingStoreKeySymbol>

export function isQuantitativeValueThingStoreKey(key: unknown): key is QuantitativeValueThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsQuantitativeValueThingStorageKeyPrefix());
}

export const LogisticsQuantitativeValueThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#QuantitativeValueThingPrefix";
export const LogisticsQuantitativeValueThingStorageKeyPrefixDefault = "QuantitativeValueThing/";

export function getLogisticsQuantitativeValueThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsQuantitativeValueThingStorageKeyPrefix, LogisticsQuantitativeValueThingStorageKeyPrefixDefault);
}

export interface QuantitativeValueThingStore extends Store<QuantitativeValueThingStoreKey, QuantitativeValueThing> {

}

export function getQuantitativeValueThingStore() {
    return getLogisticsStore<QuantitativeValueThing, typeof QuantitativeValueThingStoreKeySymbol>(getLogisticsQuantitativeValueThingStorageKeyPrefix, QuantitativeValueThingStoreKeySymbol);
}