import {OrderCheckoutReviewComponentInfo, handler as baseHandler, CheckoutItems} from "./checkout-review";
import {useInput} from "../../data";
import {CheckoutEmpty} from "../../../client/components/checkout";
import {listPaymentMethods, PaymentMethod, setOrder, ShipmentLocation} from "../../../../data";
import {FastifyReply, FastifyRequest} from "fastify";
import {getUser} from "../../../../authentication";
import {getOrderPrice} from "../../../../data/order-item/get-order-item-info";
export const path = "/order/checkout/confirmation";

export interface OrderCheckoutConfirmationComponentInfo extends OrderCheckoutReviewComponentInfo {
    paymentMethods: PaymentMethod[];
}

export async function handler(): Promise<OrderCheckoutConfirmationComponentInfo> {
    const base = await baseHandler();
    const paymentMethods = await listPaymentMethods({
        userId: getUser().userId
    })
    return {
        ...base,
        paymentMethods
    }
}

type Body = {
    to: ShipmentLocation;
    paymentMethod: {
        to: ShipmentLocation;
    }
}

type Schema = {
    Body: Body
}

export async function submit(request: FastifyRequest<Schema>, response: FastifyReply, info: OrderCheckoutConfirmationComponentInfo) {

    const { order } = info;

    const total = await getOrderPrice(order.orderId);

    console.log("Submitting order", order.orderId);

    await setOrder({
        ...order,
        status: "submitted"
    });

    response.header("Location", `/order/checkout/confirmed/${order.orderId}`);
    response.status(302);
    response.send();
}

export function Component() {
    const {
        order,
        total,
        paymentMethods
    } = useInput<OrderCheckoutConfirmationComponentInfo>();

    if (!order.products.length) {
        return <CheckoutEmpty />
    }

    return (
        <div id="checkout-confirmation" className="lg:flex lg:min-h-full flex flex-col">
            <h1 className="sr-only">Checkout</h1>
            <style dangerouslySetInnerHTML={{ __html: `
            
            #checkout-confirmation details:not([open]) .inline-on-open {
                display: none;
            }
            #checkout-confirmation details:not([open]) .hidden-on-open {
                display: inline;
            }
            #checkout-confirmation details[open] .inline-on-open {
                display: inline;
            }
            #checkout-confirmation details[open] .hidden-on-open {
                display: none;
            }
            `.trim()}} />
            <section aria-labelledby="order-heading" className="py-6 w-full">
                <details className="w-full">
                    <summary className="flex items-center justify-between">
                        <h2 id="order-heading" className="text-lg font-medium text-gray-900">
                            Your Order
                        </h2>
                        <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer select-none">
                            <span className="inline-on-open">Hide full summary</span>
                            <span className="hidden-on-open">Show full summary</span>
                        </span>
                    </summary>
                    <CheckoutItems className="divide-y divide-gray-200 border-gray-200" />
                </details>
                {total ? (
                    <p className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6 text-sm font-medium text-gray-900">
                        <span className="text-base">Total</span>
                        <span className="text-base">${total}</span>
                    </p>
                ) : undefined}
            </section>
            {
                paymentMethods.length ? (
                    <form action={path} method="POST" >
                        <input type="hidden" name="type" value="existingPaymentMethod" />
                        <div className="px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
                            <div className="col-span-3 sm:col-span-4">
                                <label htmlFor="paymentMethodId" className="block text-sm font-medium text-gray-700">
                                    Payment Method
                                </label>
                                <div className="mt-1">
                                    <select
                                        defaultValue={order.paymentMethodId}
                                        id="paymentMethodId"
                                        name="paymentMethodId"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        {paymentMethods.map(
                                            paymentMethod => (
                                                <option
                                                    key={paymentMethod.paymentMethodId}
                                                    value={paymentMethod.paymentMethodId}
                                                >
                                                    {paymentMethod.paymentMethodName}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-10 border-gray-200 pt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:order-last sm:ml-6 sm:w-auto"
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </form>
                ) : undefined
            }

            {
                paymentMethods.length === 0 ?
            <form action={path} method="POST" className="checkout-payment-method px-4 pb-36 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0 lg:pb-16">
                <input type="hidden" name="type" value="newPaymentMethod" />
                <div className="mx-auto max-w-lg lg:max-w-none">

                    <section aria-labelledby="payment-heading" className="mt-10">
                        <h2 id="payment-heading" className="text-lg font-medium text-gray-900">
                            Payment details
                        </h2>

                        <div className="mt-6 grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
                            <div className="col-span-3 sm:col-span-4">
                                <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700">
                                    Name on card
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="name-on-card"
                                        name="name-on-card"
                                        autoComplete="cc-name"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="col-span-3 sm:col-span-4">
                                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
                                    Card number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="card-number"
                                        name="card-number"
                                        autoComplete="cc-number"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 sm:col-span-3">
                                <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">
                                    Expiration date (MM/YY)
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="expiration-date"
                                        id="expiration-date"
                                        autoComplete="cc-exp"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
                                    CVC
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        name="cvc"
                                        id="cvc"
                                        autoComplete="csc"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center col-span-3">
                                <input
                                    id="save"
                                    name="save"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="ml-2">
                                    <label htmlFor="save" className="text-sm font-medium text-gray-900">
                                        Save Payment Method
                                    </label>
                                </div>
                            </div>



                            <style dangerouslySetInnerHTML={{__html: `
                        
                        .checkout-payment-method:has(input#save:checked) .block-if-save {
                            display: block;
                        }
                        
                        `.trim()}} />

                            <div className="col-span-3 sm:col-span-4 hidden block-if-save">
                                <label htmlFor="paymentMethodName" className="block text-sm font-medium text-gray-700">
                                    Payment Method Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="paymentMethodName"
                                        name="paymentMethodName"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="mt-10 border-t border-gray-200 pt-6 flex justify-end">
                        <button
                            type="submit"
                            className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:order-last sm:ml-6 sm:w-auto"
                        >
                            Confirm Order
                        </button>
                    </div>
                </div>
            </form>
            : undefined }

        </div>
    )
}