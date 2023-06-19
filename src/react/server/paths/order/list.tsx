import {useData, useOffer, useOrders, useProduct, useQuery} from "../../data";
import {listOffers, listOrders} from "../../../../data";
import {getMaybeUser, isAnonymous} from "../../../../authentication";

export const path = "/orders";
export const anonymous = true;
export const cached = true;

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export async function handler() {
    return {
        offers: await listOffers({
           public: isAnonymous()
        }),
        orders: await listOrders({
        })
    }
}

export function ListOrders() {
    const query = useQuery<{ productId?: string, offerId?: string }>();
    const orders = useOrders();
    const { isAnonymous } = useData();
    const queryOffer = useOffer(query.offerId);
    const queryProduct = useProduct(query.productId ?? queryOffer?.items[0]?.productId);
    let createUrl = "/order/create";
    let name = "";
    if (queryOffer) {
        createUrl = `${createUrl}?offerId=${queryOffer.offerId}`
        name = ` for ${queryOffer.offerName ?? queryProduct?.productName}`;
    } else if (queryProduct) {
        createUrl = `${createUrl}?productId=${queryProduct.productId}`
        name = ` for ${queryProduct.productName}`;
    }
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href={createUrl} className={LINK_CLASS}>Create Order{name}</a> : undefined}
            <div className="flex flex-col divide-y">
                {orders.map(order => (
                    <div key={order.orderId}>
                        {order.orderId}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListOrders;