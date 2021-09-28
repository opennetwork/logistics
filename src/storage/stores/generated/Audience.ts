import { Audience } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Audience
}

const AudienceStoreKeySymbol = Symbol("AudienceStoreKey");
export type AudienceStoreKey = BrandedStoreKey<StoreKey, typeof AudienceStoreKeySymbol>

export function isAudienceStoreKey(key: unknown): key is AudienceStoreKey {
    return isLogisticsStoreKey(key, getLogisticsAudienceStorageKeyPrefix());
}

export const LogisticsAudienceStorageKeyPrefix = "https://logistics.opennetwork.dev/#AudiencePrefix";
export const LogisticsAudienceStorageKeyPrefixDefault = "Audience/";

export function getLogisticsAudienceStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsAudienceStorageKeyPrefix, LogisticsAudienceStorageKeyPrefixDefault);
}

export interface AudienceStore extends Store<AudienceStoreKey, Audience> {

}

export function getAudienceStore() {
    return getLogisticsStore<Audience, typeof AudienceStoreKeySymbol>(getLogisticsAudienceStorageKeyPrefix, AudienceStoreKeySymbol);
}