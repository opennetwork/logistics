import { Invoice } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Invoice
}

const InvoiceStoreKeySymbol = Symbol("InvoiceStoreKey");
export type InvoiceStoreKey = BrandedStoreKey<StoreKey, typeof InvoiceStoreKeySymbol>

export function isInvoiceStoreKey(key: unknown): key is InvoiceStoreKey {
    return isLogisticsStoreKey(key, getLogisticsInvoiceStorageKeyPrefix());
}

export const LogisticsInvoiceStorageKeyPrefix = "https://logistics.opennetwork.dev/#InvoicePrefix";
export const LogisticsInvoiceStorageKeyPrefixDefault = "Invoice/";

export function getLogisticsInvoiceStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsInvoiceStorageKeyPrefix, LogisticsInvoiceStorageKeyPrefixDefault);
}

export interface InvoiceStore extends Store<InvoiceStoreKey, Invoice> {

}

export function getInvoiceStore() {
    return getLogisticsStore<Invoice, typeof InvoiceStoreKeySymbol>(getLogisticsInvoiceStorageKeyPrefix, InvoiceStoreKeySymbol);
}