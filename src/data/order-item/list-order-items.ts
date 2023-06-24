import {OrderItem, OrderOfferItem, OrderProductItem} from "./types";
import { getOrderItemStore } from "./store";
import {getOffer, OfferItem, ProductOfferItem} from "../offer";
import {isOrderOfferItem, isOrderProductItem, isProductOfferItem} from "./is";

export async function listOrderItems(orderId: string): Promise<
    OrderItem[]
> {
  const store = getOrderItemStore(orderId);
  return store.values();
}

export async function listOrderProducts(orderId: string, offers = true, orderItems?: OrderItem[]): Promise<OrderProductItem[]> {
  const items = orderItems ?? await listOrderItems(orderId);
  const products = items.filter(isOrderProductItem);
  if (!offers) return products;

  const offerItems = items
          .filter(isOrderOfferItem);

  const offerIds = [...new Set(offerItems.map(item => item.offerId))];
  const quantities = Object.fromEntries(
      offerIds.map(
          (offerId) => {
              const sum = offerItems.filter(item => item.offerId === offerId).reduce(
                  (sum, item) => sum + (item.quantity ?? 1),
                  0
              );
              return [offerId, sum] as const;
          }
      )
  )



  const offerProducts = await Promise.all(
      offerIds
          .map(offerId => offerItems.find(item => item.offerId === offerId))
          .map(async (item): Promise<OrderProductItem[]> => {
            const offer = await getOffer(item.offerId);
            return offer.items
                .filter(isProductOfferItem)
                .map((offer): OrderProductItem => ({
                  ...item,
                  orderId,
                  productId: offer.productId,
                  quantity: (offer.quantity ?? 1) * (quantities[item.offerId] ?? 1),
                  identifiers: offer.identifiers,
                }))
          })
  );

  return offerProducts
      .flatMap<OrderProductItem>(value => value)
      .concat(products);
}