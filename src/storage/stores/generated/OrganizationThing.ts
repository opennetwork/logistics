import { OrganizationThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    OrganizationThing
}

const OrganizationThingStoreKeySymbol = Symbol("OrganizationThingStoreKey");
export type OrganizationThingStoreKey = BrandedStoreKey<StoreKey, typeof OrganizationThingStoreKeySymbol>

export function isOrganizationThingStoreKey(key: unknown): key is OrganizationThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrganizationThingStorageKeyPrefix());
}

export const LogisticsOrganizationThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrganizationThingPrefix";
export const LogisticsOrganizationThingStorageKeyPrefixDefault = "OrganizationThing/";

export function getLogisticsOrganizationThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrganizationThingStorageKeyPrefix, LogisticsOrganizationThingStorageKeyPrefixDefault);
}

export interface OrganizationThingStore extends Store<OrganizationThingStoreKey, OrganizationThing> {

}

export function getOrganizationThingStore() {
    return getLogisticsStore<OrganizationThing, typeof OrganizationThingStoreKeySymbol>(getLogisticsOrganizationThingStorageKeyPrefix, OrganizationThingStoreKeySymbol);
}