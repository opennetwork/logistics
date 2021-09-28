import { AudienceThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    AudienceThing
}

const AudienceThingStoreKeySymbol = Symbol("AudienceThingStoreKey");
export type AudienceThingStoreKey = BrandedStoreKey<StoreKey, typeof AudienceThingStoreKeySymbol>

export function isAudienceThingStoreKey(key: unknown): key is AudienceThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsAudienceThingStorageKeyPrefix());
}

export const LogisticsAudienceThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#AudienceThingPrefix";
export const LogisticsAudienceThingStorageKeyPrefixDefault = "AudienceThing/";

export function getLogisticsAudienceThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsAudienceThingStorageKeyPrefix, LogisticsAudienceThingStorageKeyPrefixDefault);
}

export interface AudienceThingStore extends Store<AudienceThingStoreKey, AudienceThing> {

}

export function getAudienceThingStore() {
    return getLogisticsStore<AudienceThing, typeof AudienceThingStoreKeySymbol>(getLogisticsAudienceThingStorageKeyPrefix, AudienceThingStoreKeySymbol);
}