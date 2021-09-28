import { PaymentMethod } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PaymentMethod
}

const PaymentMethodStoreKeySymbol = Symbol("PaymentMethodStoreKey");
export type PaymentMethodStoreKey = BrandedStoreKey<StoreKey, typeof PaymentMethodStoreKeySymbol>

export function isPaymentMethodStoreKey(key: unknown): key is PaymentMethodStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPaymentMethodStorageKeyPrefix());
}

export const LogisticsPaymentMethodStorageKeyPrefix = "https://logistics.opennetwork.dev/#PaymentMethodPrefix";
export const LogisticsPaymentMethodStorageKeyPrefixDefault = "PaymentMethod/";

export function getLogisticsPaymentMethodStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPaymentMethodStorageKeyPrefix, LogisticsPaymentMethodStorageKeyPrefixDefault);
}

export interface PaymentMethodStore extends Store<PaymentMethodStoreKey, PaymentMethod> {

}

export function getPaymentMethodStore() {
    return getLogisticsStore<PaymentMethod, typeof PaymentMethodStoreKeySymbol>(getLogisticsPaymentMethodStorageKeyPrefix, PaymentMethodStoreKeySymbol);
}