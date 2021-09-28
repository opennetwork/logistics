import { ReviewThing } from "@opennetwork/environments-schema-org-logistics";
import {
    BrandedStoreKey,
    getLogisticsStorageKeyPrefix,
    getLogisticsStore,
    isLogisticsStoreKey,
    StoreKey,
} from "../../key";
import {Store} from "@opennetwork/environment";

export {
    ReviewThing
}

const ReviewThingStoreKeySymbol = Symbol("ReviewThingStoreKey");
export type ReviewThingStoreKey = BrandedStoreKey<StoreKey, typeof ReviewThingStoreKeySymbol>

export function isReviewThingStoreKey(key: unknown): key is ReviewThingStoreKey {
    return isLogisticsStoreKey(key, getLogisticsReviewThingStorageKeyPrefix());
}

export const LogisticsReviewThingStorageKeyPrefix = "https://logistics.opennetwork.dev/#ReviewThingPrefix";
export const LogisticsReviewThingStorageKeyPrefixDefault = "ReviewThing/";

export function getLogisticsReviewThingStorageKeyPrefix() {
    return getLogisticsStorageKeyPrefix(LogisticsReviewThingStorageKeyPrefix, LogisticsReviewThingStorageKeyPrefixDefault);
}

export interface ReviewThingStore extends Store<ReviewThingStoreKey, ReviewThing> {

}

export function getReviewThingStore() {
    return getLogisticsStore<ReviewThing, typeof ReviewThingStoreKeySymbol>(getLogisticsReviewThingStorageKeyPrefix, ReviewThingStoreKeySymbol);
}