import { LoanOrCredit } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    LoanOrCredit
}

const LoanOrCreditStoreKeySymbol = Symbol("LoanOrCreditStoreKey");
export type LoanOrCreditStoreKey = BrandedStoreKey<StoreKey, typeof LoanOrCreditStoreKeySymbol>

export function isLoanOrCreditStoreKey(key: unknown): key is LoanOrCreditStoreKey {
    return isLogisticsStoreKey(key, getLogisticsLoanOrCreditStorageKeyPrefix());
}

export const LogisticsLoanOrCreditStorageKeyPrefix = "https://logistics.opennetwork.dev/#LoanOrCreditPrefix";
export const LogisticsLoanOrCreditStorageKeyPrefixDefault = "LoanOrCredit/";

export function getLogisticsLoanOrCreditStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsLoanOrCreditStorageKeyPrefix, LogisticsLoanOrCreditStorageKeyPrefixDefault);
}

export interface LoanOrCreditStore extends Store<LoanOrCreditStoreKey, LoanOrCredit> {

}

export function getLoanOrCreditStore() {
    return getLogisticsStore<LoanOrCredit, typeof LoanOrCreditStoreKeySymbol>(getLogisticsLoanOrCreditStorageKeyPrefix, LoanOrCreditStoreKeySymbol);
}