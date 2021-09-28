import { Demand } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Demand
}

const DemandStoreKeySymbol = Symbol("DemandStoreKey");
export type DemandStoreKey = BrandedStoreKey<StoreKey, typeof DemandStoreKeySymbol>

export function isDemandStoreKey(key: unknown): key is DemandStoreKey {
    return isLogisticsStoreKey(key, getLogisticsDemandStorageKeyPrefix());
}

export const LogisticsDemandStorageKeyPrefix = "https://logistics.opennetwork.dev/#DemandPrefix";
export const LogisticsDemandStorageKeyPrefixDefault = "Demand/";

export function getLogisticsDemandStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsDemandStorageKeyPrefix, LogisticsDemandStorageKeyPrefixDefault);
}

export interface DemandStore extends Store<DemandStoreKey, Demand> {

}

export function getDemandStore() {
    return getLogisticsStore<Demand, typeof DemandStoreKeySymbol>(getLogisticsDemandStorageKeyPrefix, DemandStoreKeySymbol);
}