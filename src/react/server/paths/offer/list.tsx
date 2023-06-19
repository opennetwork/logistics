import {useData, useOffers, useProduct, useQuery} from "../../data";
import {listOffers} from "../../../../data";
import {isAnonymous} from "../../../../authentication";

export const path = "/offers";
export const anonymous = true;
export const cached = true;

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export async function handler() {
    return {
        offers: await listOffers({
            public: isAnonymous()
        })
    }
}

export function ListOffers() {
    const query = useQuery<{ productId?: string }>();
    const offers = useOffers();
    const { isAnonymous } = useData();
    const queryProduct = useProduct(query.productId);
    let createUrl = "/offer/create";
    if (queryProduct) {
        createUrl = `${createUrl}?productId=${queryProduct.productId}`
    }
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href={createUrl} className={LINK_CLASS}>Create Offer{queryProduct.productId ? ` for ${queryProduct.productName}` : ""}</a> : undefined}
            <div className="flex flex-col divide-y">
                {offers.map(offer => (
                    <div key={offer.offerId}>
                        {offer.offerName}
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListOffers;