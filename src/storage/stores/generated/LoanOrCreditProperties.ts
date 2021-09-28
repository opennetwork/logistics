import { LoanOrCreditProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    LoanOrCreditProperties
}

const LoanOrCreditPropertiesStoreKeySymbol = Symbol("LoanOrCreditPropertiesStoreKey");
export type LoanOrCreditPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof LoanOrCreditPropertiesStoreKeySymbol>

export function isLoanOrCreditPropertiesStoreKey(key: unknown): key is LoanOrCreditPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsLoanOrCreditPropertiesStorageKeyPrefix());
}

export const LogisticsLoanOrCreditPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#LoanOrCreditPropertiesPrefix";
export const LogisticsLoanOrCreditPropertiesStorageKeyPrefixDefault = "LoanOrCreditProperties/";

export function getLogisticsLoanOrCreditPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsLoanOrCreditPropertiesStorageKeyPrefix, LogisticsLoanOrCreditPropertiesStorageKeyPrefixDefault);
}

export interface LoanOrCreditPropertiesStore extends Store<LoanOrCreditPropertiesStoreKey, LoanOrCreditProperties> {

}

export function getLoanOrCreditPropertiesStore() {
    return getLogisticsStore<LoanOrCreditProperties, typeof LoanOrCreditPropertiesStoreKeySymbol>(getLogisticsLoanOrCreditPropertiesStorageKeyPrefix, LoanOrCreditPropertiesStoreKeySymbol);
}