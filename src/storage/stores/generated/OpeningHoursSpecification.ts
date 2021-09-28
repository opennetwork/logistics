import { OpeningHoursSpecification } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OpeningHoursSpecification
}

const OpeningHoursSpecificationStoreKeySymbol = Symbol("OpeningHoursSpecificationStoreKey");
export type OpeningHoursSpecificationStoreKey = BrandedStoreKey<StoreKey, typeof OpeningHoursSpecificationStoreKeySymbol>

export function isOpeningHoursSpecificationStoreKey(key: unknown): key is OpeningHoursSpecificationStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOpeningHoursSpecificationStorageKeyPrefix());
}

export const LogisticsOpeningHoursSpecificationStorageKeyPrefix = "https://logistics.opennetwork.dev/#OpeningHoursSpecificationPrefix";
export const LogisticsOpeningHoursSpecificationStorageKeyPrefixDefault = "OpeningHoursSpecification/";

export function getLogisticsOpeningHoursSpecificationStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOpeningHoursSpecificationStorageKeyPrefix, LogisticsOpeningHoursSpecificationStorageKeyPrefixDefault);
}

export interface OpeningHoursSpecificationStore extends Store<OpeningHoursSpecificationStoreKey, OpeningHoursSpecification> {

}

export function getOpeningHoursSpecificationStore() {
    return getLogisticsStore<OpeningHoursSpecification, typeof OpeningHoursSpecificationStoreKeySymbol>(getLogisticsOpeningHoursSpecificationStorageKeyPrefix, OpeningHoursSpecificationStoreKeySymbol);
}