import { TypeAndQuantityNode } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    TypeAndQuantityNode
}

const TypeAndQuantityNodeStoreKeySymbol = Symbol("TypeAndQuantityNodeStoreKey");
export type TypeAndQuantityNodeStoreKey = BrandedStoreKey<StoreKey, typeof TypeAndQuantityNodeStoreKeySymbol>

export function isTypeAndQuantityNodeStoreKey(key: unknown): key is TypeAndQuantityNodeStoreKey {
    return isLogisticsStoreKey(key, getLogisticsTypeAndQuantityNodeStorageKeyPrefix());
}

export const LogisticsTypeAndQuantityNodeStorageKeyPrefix = "https://logistics.opennetwork.dev/#TypeAndQuantityNodePrefix";
export const LogisticsTypeAndQuantityNodeStorageKeyPrefixDefault = "TypeAndQuantityNode/";

export function getLogisticsTypeAndQuantityNodeStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsTypeAndQuantityNodeStorageKeyPrefix, LogisticsTypeAndQuantityNodeStorageKeyPrefixDefault);
}

export interface TypeAndQuantityNodeStore extends Store<TypeAndQuantityNodeStoreKey, TypeAndQuantityNode> {

}

export function getTypeAndQuantityNodeStore() {
    return getLogisticsStore<TypeAndQuantityNode, typeof TypeAndQuantityNodeStoreKeySymbol>(getLogisticsTypeAndQuantityNodeStorageKeyPrefix, TypeAndQuantityNodeStoreKeySymbol);
}