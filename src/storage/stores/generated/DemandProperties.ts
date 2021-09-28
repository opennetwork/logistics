import { DemandProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    DemandProperties
}

const DemandPropertiesStoreKeySymbol = Symbol("DemandPropertiesStoreKey");
export type DemandPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof DemandPropertiesStoreKeySymbol>

export function isDemandPropertiesStoreKey(key: unknown): key is DemandPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDemandPropertiesStorageKeyPrefix());
}

export const LogisticsDemandPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#DemandPropertiesPrefix";
export const LogisticsDemandPropertiesStorageKeyPrefixDefault = "DemandProperties/";

export function getLogisticsDemandPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDemandPropertiesStorageKeyPrefix, LogisticsDemandPropertiesStorageKeyPrefixDefault);
}

export interface DemandPropertiesStore extends Store<DemandPropertiesStoreKey, DemandProperties> {

}

export function getDemandPropertiesStore() {
    return getLogisticsStore<DemandProperties, typeof DemandPropertiesStoreKeySymbol>(getLogisticsDemandPropertiesStorageKeyPrefix, DemandPropertiesStoreKeySymbol);
}