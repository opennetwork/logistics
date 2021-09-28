import { Review } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    Review
}

const ReviewStoreKeySymbol = Symbol("ReviewStoreKey");
export type ReviewStoreKey = BrandedStoreKey<StoreKey, typeof ReviewStoreKeySymbol>

export function isReviewStoreKey(key: unknown): key is ReviewStoreKey {
    return isLogisticsStoreKey(key, getLogisticsReviewStorageKeyPrefix());
}

export const LogisticsReviewStorageKeyPrefix = "https://logistics.opennetwork.dev/#ReviewPrefix";
export const LogisticsReviewStorageKeyPrefixDefault = "Review/";

export function getLogisticsReviewStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsReviewStorageKeyPrefix, LogisticsReviewStorageKeyPrefixDefault);
}

export interface ReviewStore extends Store<ReviewStoreKey, Review> {

}

export function getReviewStore() {
    return getLogisticsStore<Review, typeof ReviewStoreKeySymbol>(getLogisticsReviewStorageKeyPrefix, ReviewStoreKeySymbol);
}