import { AudienceProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    AudienceProperties
}

const AudiencePropertiesStoreKeySymbol = Symbol("AudiencePropertiesStoreKey");
export type AudiencePropertiesStoreKey = BrandedStoreKey<StoreKey, typeof AudiencePropertiesStoreKeySymbol>

export function isAudiencePropertiesStoreKey(key: unknown): key is AudiencePropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsAudiencePropertiesStorageKeyPrefix());
}

export const LogisticsAudiencePropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#AudiencePropertiesPrefix";
export const LogisticsAudiencePropertiesStorageKeyPrefixDefault = "AudienceProperties/";

export function getLogisticsAudiencePropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsAudiencePropertiesStorageKeyPrefix, LogisticsAudiencePropertiesStorageKeyPrefixDefault);
}

export interface AudiencePropertiesStore extends Store<AudiencePropertiesStoreKey, AudienceProperties> {

}

export function getAudiencePropertiesStore() {
    return getLogisticsStore<AudienceProperties, typeof AudiencePropertiesStoreKeySymbol>(getLogisticsAudiencePropertiesStorageKeyPrefix, AudiencePropertiesStoreKeySymbol);
}