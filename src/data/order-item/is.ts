import {OrderItem, OrderOfferItem, OrderProductItem} from "./types";
import {OfferItem, ProductOfferItem} from "../offer";

export function isOrderProductItem(item: OrderItem): item is OrderProductItem {
    return !!item.productId;
}

export function isOrderOfferItem(item: OrderItem): item is OrderOfferItem {
    return !!item.offerId;
}

export function isProductOfferItem(item: OfferItem): item is ProductOfferItem {
    return item.type === "product";
}