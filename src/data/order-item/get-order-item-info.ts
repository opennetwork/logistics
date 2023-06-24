import {listOrderItems, listOrderProducts} from "./list-order-items";
import {isOrderOfferItem} from "./is";
import {getOffer, DEFAULT_CURRENCY} from "../offer";
import {ok} from "../../is";
import {OrderItem} from "./types";


export async function getOrderPrice(orderId: string, givenItems?: OrderItem[]) {
    const items = givenItems ?? await listOrderItems(orderId);
    const offerItems = items.filter(isOrderOfferItem);
    const offerIds = [...new Set(
        offerItems.map(item => item.offerId)
    )];
    const offerQuantities = new Map(
        offerIds.map(
            offerId => {
                const matching = offerItems.filter(item => item.offerId === offerId);
                const quantity = matching.reduce(
                    (sum, offer) => {
                        return sum + (offer.quantity ?? 1);
                    },
                    0
                );
                return [offerId, quantity] as const;
            }
        )
    )
    const offers = await Promise.all(
        offerIds.map(offerId => getOffer(offerId))
    );
    if (!offers.length) {
        return {
            price: "",
            currency: ""
        }
    }

    const offerMap = new Map(
        offers.map(
            offer => [offer.offerId, offer] as const
        )
    )
    const currencies = [...new Set(
        offers.map(item => item.currency || DEFAULT_CURRENCY)
    )];
    // TODO if this is required...
    ok(currencies.length === 1, "Expected same currency across offers");

    const price = offerIds.reduce(
        (sum, offerId) => {
            return sum + (offerQuantities.get(offerId) * (+offerMap.get(offerId).price))
        },
        0
    )

    return {
        price: (Math.round(price * 100) / 100).toFixed(2),
        currency: currencies[0]
    }
}