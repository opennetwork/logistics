import { PaymentMethodThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    PaymentMethodThing
}

const PaymentMethodThingStoreKeySymbol = Symbol("PaymentMethodThingStoreKey");
export type PaymentMethodThingStoreKey = BrandedStoreKey<StoreKey, typeof PaymentMethodThingStoreKeySymbol>

export function isPaymentMethodThingStoreKey(key: unknown): key is PaymentMethodThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsPaymentMethodThingStorageKeyPrefix());
}

export const LogisticsPaymentMethodThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#PaymentMethodThingPrefix";
export const LogisticsPaymentMethodThingStorageKeyPrefixDefault = "PaymentMethodThing/";

export function getLogisticsPaymentMethodThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsPaymentMethodThingStorageKeyPrefix, LogisticsPaymentMethodThingStorageKeyPrefixDefault);
}

export interface PaymentMethodThingStore extends Store<PaymentMethodThingStoreKey, PaymentMethodThing> {

}

export function getPaymentMethodThingStore() {
    return getLogisticsStore<PaymentMethodThing, typeof PaymentMethodThingStoreKeySymbol>(getLogisticsPaymentMethodThingStorageKeyPrefix, PaymentMethodThingStoreKeySymbol);
}