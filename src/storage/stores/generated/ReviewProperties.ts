import { ReviewProperties } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ReviewProperties
}

const ReviewPropertiesStoreKeySymbol = Symbol("ReviewPropertiesStoreKey");
export type ReviewPropertiesStoreKey = BrandedStoreKey<StoreKey, typeof ReviewPropertiesStoreKeySymbol>

export function isReviewPropertiesStoreKey(key: unknown): key is ReviewPropertiesStoreKey {
    return isLogisticsStoreKey(key, getLogisticsReviewPropertiesStorageKeyPrefix());
}

export const LogisticsReviewPropertiesStorageKeyPrefix = "https://logistics.opennetwork.dev/#ReviewPropertiesPrefix";
export const LogisticsReviewPropertiesStorageKeyPrefixDefault = "ReviewProperties/";

export function getLogisticsReviewPropertiesStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsReviewPropertiesStorageKeyPrefix, LogisticsReviewPropertiesStorageKeyPrefixDefault);
}

export interface ReviewPropertiesStore extends Store<ReviewPropertiesStoreKey, ReviewProperties> {

}

export function getReviewPropertiesStore() {
    return getLogisticsStore<ReviewProperties, typeof ReviewPropertiesStoreKeySymbol>(getLogisticsReviewPropertiesStorageKeyPrefix, ReviewPropertiesStoreKeySymbol);
}