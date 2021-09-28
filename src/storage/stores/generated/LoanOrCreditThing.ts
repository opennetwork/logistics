import { LoanOrCreditThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    LoanOrCreditThing
}

const LoanOrCreditThingStoreKeySymbol = Symbol("LoanOrCreditThingStoreKey");
export type LoanOrCreditThingStoreKey = BrandedStoreKey<StoreKey, typeof LoanOrCreditThingStoreKeySymbol>

export function isLoanOrCreditThingStoreKey(key: unknown): key is LoanOrCreditThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsLoanOrCreditThingStorageKeyPrefix());
}

export const LogisticsLoanOrCreditThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#LoanOrCreditThingPrefix";
export const LogisticsLoanOrCreditThingStorageKeyPrefixDefault = "LoanOrCreditThing/";

export function getLogisticsLoanOrCreditThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsLoanOrCreditThingStorageKeyPrefix, LogisticsLoanOrCreditThingStorageKeyPrefixDefault);
}

export interface LoanOrCreditThingStore extends Store<LoanOrCreditThingStoreKey, LoanOrCreditThing> {

}

export function getLoanOrCreditThingStore() {
    return getLogisticsStore<LoanOrCreditThing, typeof LoanOrCreditThingStoreKeySymbol>(getLogisticsLoanOrCreditThingStorageKeyPrefix, LoanOrCreditThingStoreKeySymbol);
}