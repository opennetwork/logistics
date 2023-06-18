import {OrderItem, OrderOfferItem, OrderProductItem} from "./types";
import { getOrderItemStore } from "./store";
import {getOffer, OfferItem, ProductOfferItem} from "../offer";

export async function listOrderItems(orderId: string): Promise<
    OrderItem[]
> {
  const store = getOrderItemStore(orderId);
  return store.values();
}

export async function listOrderProducts(orderId: string): Promise<OrderProductItem[]> {
  const items = await listOrderItems(orderId);
  const products = items.filter(isOrderProductItem);
  const offerProducts = await Promise.all(
      items
          .filter(isOrderOfferItem)
          .map(async (item): Promise<OrderProductItem[]> => {
            const offer = await getOffer(item.offerId);
            return offer.items
                .filter(isProductOfferItem)
                .map((offer): OrderProductItem => ({
                  ...item,
                  offerId: undefined,
                  productId: offer.productId,
                  quantity: (offer.quantity ?? 1) * (item.quantity ?? 1),
                  identifiers: offer.identifiers
                }))
          })
  );

  return offerProducts
      .flatMap<OrderProductItem>(value => value)
      .concat(products);

  function isOrderProductItem(item: OrderItem): item is OrderProductItem {
    return !!item.productId;
  }

  function isOrderOfferItem(item: OrderItem): item is OrderOfferItem {
    return !!item.offerId;
  }

  function isProductOfferItem(item: OfferItem): item is ProductOfferItem {
    return item.type === "product";
  }
}