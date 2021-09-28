import { FinancialProduct } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    FinancialProduct
}

const FinancialProductStoreKeySymbol = Symbol("FinancialProductStoreKey");
export type FinancialProductStoreKey = BrandedStoreKey<StoreKey, typeof FinancialProductStoreKeySymbol>

export function isFinancialProductStoreKey(key: unknown): key is FinancialProductStoreKey {
    return isLogisticsStoreKey(key, getLogisticsFinancialProductStorageKeyPrefix());
}

export const LogisticsFinancialProductStorageKeyPrefix = "https://logistics.opennetwork.dev/#FinancialProductPrefix";
export const LogisticsFinancialProductStorageKeyPrefixDefault = "FinancialProduct/";

export function getLogisticsFinancialProductStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsFinancialProductStorageKeyPrefix, LogisticsFinancialProductStorageKeyPrefixDefault);
}

export interface FinancialProductStore extends Store<FinancialProductStoreKey, FinancialProduct> {

}

export function getFinancialProductStore() {
    return getLogisticsStore<FinancialProduct, typeof FinancialProductStoreKeySymbol>(getLogisticsFinancialProductStorageKeyPrefix, FinancialProductStoreKeySymbol);
}