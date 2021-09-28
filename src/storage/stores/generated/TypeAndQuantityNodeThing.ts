import { TypeAndQuantityNodeThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    TypeAndQuantityNodeThing
}

const TypeAndQuantityNodeThingStoreKeySymbol = Symbol("TypeAndQuantityNodeThingStoreKey");
export type TypeAndQuantityNodeThingStoreKey = BrandedStoreKey<StoreKey, typeof TypeAndQuantityNodeThingStoreKeySymbol>

export function isTypeAndQuantityNodeThingStoreKey(key: unknown): key is TypeAndQuantityNodeThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsTypeAndQuantityNodeThingStorageKeyPrefix());
}

export const LogisticsTypeAndQuantityNodeThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#TypeAndQuantityNodeThingPrefix";
export const LogisticsTypeAndQuantityNodeThingStorageKeyPrefixDefault = "TypeAndQuantityNodeThing/";

export function getLogisticsTypeAndQuantityNodeThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsTypeAndQuantityNodeThingStorageKeyPrefix, LogisticsTypeAndQuantityNodeThingStorageKeyPrefixDefault);
}

export interface TypeAndQuantityNodeThingStore extends Store<TypeAndQuantityNodeThingStoreKey, TypeAndQuantityNodeThing> {

}

export function getTypeAndQuantityNodeThingStore() {
    return getLogisticsStore<TypeAndQuantityNodeThing, typeof TypeAndQuantityNodeThingStoreKeySymbol>(getLogisticsTypeAndQuantityNodeThingStorageKeyPrefix, TypeAndQuantityNodeThingStoreKeySymbol);
}