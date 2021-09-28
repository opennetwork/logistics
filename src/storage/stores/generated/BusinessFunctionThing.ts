import { BusinessFunctionThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    BusinessFunctionThing
}

const BusinessFunctionThingStoreKeySymbol = Symbol("BusinessFunctionThingStoreKey");
export type BusinessFunctionThingStoreKey = BrandedStoreKey<StoreKey, typeof BusinessFunctionThingStoreKeySymbol>

export function isBusinessFunctionThingStoreKey(key: unknown): key is BusinessFunctionThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsBusinessFunctionThingStorageKeyPrefix());
}

export const LogisticsBusinessFunctionThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#BusinessFunctionThingPrefix";
export const LogisticsBusinessFunctionThingStorageKeyPrefixDefault = "BusinessFunctionThing/";

export function getLogisticsBusinessFunctionThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsBusinessFunctionThingStorageKeyPrefix, LogisticsBusinessFunctionThingStorageKeyPrefixDefault);
}

export interface BusinessFunctionThingStore extends Store<BusinessFunctionThingStoreKey, BusinessFunctionThing> {

}

export function getBusinessFunctionThingStore() {
    return getLogisticsStore<BusinessFunctionThing, typeof BusinessFunctionThingStoreKeySymbol>(getLogisticsBusinessFunctionThingStorageKeyPrefix, BusinessFunctionThingStoreKeySymbol);
}