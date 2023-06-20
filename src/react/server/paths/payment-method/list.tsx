import {useData, usePaymentMethods} from "../../data";
import {getMaybePartner, getMaybeUser} from "../../../../authentication";
import {listPaymentMethods} from "../../../../data";
import {getUserIdentifiers} from "./utils";

export const path = "/payment-methods";
export const anonymous = true;
export const cache = true;

export async function handler() {
    return {
        paymentMethods: await listPaymentMethods(getUserIdentifiers())
    }
}

const LINK_CLASS = "text-blue-600 hover:bg-white underline hover:underline-offset-2";

export function ListPaymentMethods() {
    const paymentMethods = usePaymentMethods();
    const { isAnonymous } = useData();
    return (
        <div className="flex flex-col">
            {!isAnonymous ? <a href="/payment-method/create" className={LINK_CLASS}>Create Payment Method</a> : undefined}
            <div className="flex flex-col divide-y">
                {paymentMethods.map(paymentMethod => (
                    <div key={paymentMethod.paymentMethodId} className="flex flex-row justify-between">
                        <div>{paymentMethod.paymentMethodName}</div>
                        {
                            !isAnonymous ? (
                                <div>
                                    <a href={`/offers?paymentMethodId=${paymentMethod.paymentMethodId}`} className={LINK_CLASS}>
                                        Offers
                                    </a>
                                </div>
                            ) : undefined
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Component = ListPaymentMethods;