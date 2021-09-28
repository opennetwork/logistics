import { FinancialProductProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    FinancialProductProperties
}

const FinancialProductPropertiesStoreKeySymbol = Symbol("FinancialProductPropertiesStoreKey");
export type FinancialProductPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof FinancialProductPropertiesStoreKeySymbol>

export function isFinancialProductPropertiesStoreKey(key: unknown): key is FinancialProductPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsFinancialProductPropertiesStorageKeyPrefix());
}

export const LogisticsFinancialProductPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#FinancialProductPropertiesPrefix";
export const LogisticsFinancialProductPropertiesStorageKeyPrefixDefault = "FinancialProductProperties/";

export function getLogisticsFinancialProductPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsFinancialProductPropertiesStorageKeyPrefix, LogisticsFinancialProductPropertiesStorageKeyPrefixDefault);
}

export interface FinancialProductPropertiesStore extends Store<FinancialProductPropertiesStoreKey, FinancialProductProperties> {

}

export function getFinancialProductPropertiesStore() {
    return getLogisticsStore<FinancialProductProperties, typeof FinancialProductPropertiesStoreKeySymbol>(getLogisticsFinancialProductPropertiesStorageKeyPrefix, FinancialProductPropertiesStoreKeySymbol);
}