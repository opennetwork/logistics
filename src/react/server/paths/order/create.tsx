import { FastifyRequest } from "fastify";
import {
    useError,
    useMaybeBody,
    useMaybeResult, useOffer,
    useProduct,
    useQuery,
    useQuerySearch,
    useSubmitted,
    useTimezone
} from "../../data";
import {
    Order,
    OrderData,
    addOrder, listOffers, listOrders
} from "../../../../data";
import {ok} from "../../../../is";
import {getMaybeUser, isAnonymous} from "../../../../authentication";

export const path = "/order/create";

export async function handler() {
    return {
        offers: await listOffers({
            public: isAnonymous()
        })
    }
}

export const MINUTE_MS = 60 * 1000;
export const DAY_MS = 24 * 60 * MINUTE_MS;

const FORM_CLASS = `
mt-1
block
w-full
md:max-w-sm
rounded-md
border-gray-300
shadow-sm
focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
disabled:bg-slate-300 disabled:cursor-not-allowed
`.trim();
const FORM_GROUP_CLASS = `block py-2`;

function assertOrderData(value: unknown): asserts value is OrderData {
    ok<OrderData>(value);
    ok(value.status, "Expected status");
}

export async function submit(request: FastifyRequest) {
    const data = request.body;
    assertOrderData(data);
    const order = await addOrder(data);
    console.log({ order })
    return { success: true, order };
}

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export function CreateOrder() {
    const query = useQuery<{ productId?: string, offerId?: string }>();
    const body = useMaybeBody<OrderData>();
    const queryOffer = useOffer(query.offerId ?? body?.items[0]?.offerId);
    const queryProduct = useProduct(query.productId ?? body?.items[0]?.productId);
    const timezone = useTimezone();
    const submitted = useSubmitted();
    const result = useMaybeResult<{ success: boolean; order: Order }>();
    const error = useError();

    console.error(error);

    return <OrderBody body={result?.success ? undefined : body} />

    function OrderBody({ body }: { body?: OrderData }) {
        return (
            <form name="order" action="/order/create#action-section" method="post">
                <input type="hidden" name="status" value={body?.status || "pending"} />
                {
                    queryOffer ? (
                        <>
                            <input type="hidden" name="items[0].offerId" value={queryOffer.offerId} />
                            <div className="flex flex-col">
                                <label className={FORM_GROUP_CLASS}>
                                    <span className="text-gray-700">Offer Name</span>
                                    <input
                                        className={FORM_CLASS}
                                        disabled
                                        type="text"
                                        placeholder="Offer Name"
                                        defaultValue={queryOffer.offerName || ""}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col">
                                <label className={FORM_GROUP_CLASS}>
                                    <span className="text-gray-700">Offer Quantity</span>
                                    <input
                                        className={FORM_CLASS}
                                        type="text"
                                        placeholder="Offer Quantity"
                                        name="items[0].quantity"
                                        defaultValue={(body?.items[0]?.quantity ?? "1").toString()}
                                    />
                                </label>
                            </div>
                        </>
                    ): queryProduct ? (
                        <>
                            <input type="hidden" name="items[0].productId" value={queryProduct.productId} />
                            <div className="flex flex-col">
                                <label className={FORM_GROUP_CLASS}>
                                    <span className="text-gray-700">Product Name</span>
                                    <input
                                        className={FORM_CLASS}
                                        disabled
                                        type="text"
                                        placeholder="Product Name"
                                        defaultValue={queryProduct.productName || ""}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col">
                                <label className={FORM_GROUP_CLASS}>
                                    <span className="text-gray-700">Product Quantity</span>
                                    <input
                                        className={FORM_CLASS}
                                        type="text"
                                        placeholder="Product Quantity"
                                        name="items[0].quantity"
                                        defaultValue={(body?.items[0]?.quantity ?? "1").toString()}
                                    />
                                </label>
                            </div>
                        </>
                    ) : undefined
                }
                <div id="action-section">
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
                    >
                        Save Order
                    </button>
                </div>
            </form>
        )
    }
}

export const Component = CreateOrder;