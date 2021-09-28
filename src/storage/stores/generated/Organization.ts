import { Organization } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Organization
}

const OrganizationStoreKeySymbol = Symbol("OrganizationStoreKey");
export type OrganizationStoreKey = BrandedStoreKey<StoreKey, typeof OrganizationStoreKeySymbol>

export function isOrganizationStoreKey(key: unknown): key is OrganizationStoreKey {
    return isLogisticsStoreKey(key, getLogisticsOrganizationStorageKeyPrefix());
}

export const LogisticsOrganizationStorageKeyPrefix = "https://logistics.opennetwork.dev/#OrganizationPrefix";
export const LogisticsOrganizationStorageKeyPrefixDefault = "Organization/";

export function getLogisticsOrganizationStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsOrganizationStorageKeyPrefix, LogisticsOrganizationStorageKeyPrefixDefault);
}

export interface OrganizationStore extends Store<OrganizationStoreKey, Organization> {

}

export function getOrganizationStore() {
    return getLogisticsStore<Organization, typeof OrganizationStoreKeySymbol>(getLogisticsOrganizationStorageKeyPrefix, OrganizationStoreKeySymbol);
}