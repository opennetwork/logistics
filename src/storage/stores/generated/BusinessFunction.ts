import { BusinessFunction } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    BusinessFunction
}

const BusinessFunctionStoreKeySymbol = Symbol("BusinessFunctionStoreKey");
export type BusinessFunctionStoreKey = BrandedStoreKey<StoreKey, typeof BusinessFunctionStoreKeySymbol>

export function isBusinessFunctionStoreKey(key: unknown): key is BusinessFunctionStoreKey {
    return isLogisticsStoreKey(key, getLogisticsBusinessFunctionStorageKeyPrefix());
}

export const LogisticsBusinessFunctionStorageKeyPrefix = "https://logistics.opennetwork.dev/#BusinessFunctionPrefix";
export const LogisticsBusinessFunctionStorageKeyPrefixDefault = "BusinessFunction/";

export function getLogisticsBusinessFunctionStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsBusinessFunctionStorageKeyPrefix, LogisticsBusinessFunctionStorageKeyPrefixDefault);
}

export interface BusinessFunctionStore extends Store<BusinessFunctionStoreKey, BusinessFunction> {

}

export function getBusinessFunctionStore() {
    return getLogisticsStore<BusinessFunction, typeof BusinessFunctionStoreKeySymbol>(getLogisticsBusinessFunctionStorageKeyPrefix, BusinessFunctionStoreKeySymbol);
}