import { InvoiceThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    InvoiceThing
}

const InvoiceThingStoreKeySymbol = Symbol("InvoiceThingStoreKey");
export type InvoiceThingStoreKey = BrandedStoreKey<StoreKey, typeof InvoiceThingStoreKeySymbol>

export function isInvoiceThingStoreKey(key: unknown): key is InvoiceThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsInvoiceThingStorageKeyPrefix());
}

export const LogisticsInvoiceThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#InvoiceThingPrefix";
export const LogisticsInvoiceThingStorageKeyPrefixDefault = "InvoiceThing/";

export function getLogisticsInvoiceThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsInvoiceThingStorageKeyPrefix, LogisticsInvoiceThingStorageKeyPrefixDefault);
}

export interface InvoiceThingStore extends Store<InvoiceThingStoreKey, InvoiceThing> {

}

export function getInvoiceThingStore() {
    return getLogisticsStore<InvoiceThing, typeof InvoiceThingStoreKeySymbol>(getLogisticsInvoiceThingStorageKeyPrefix, InvoiceThingStoreKeySymbol);
}