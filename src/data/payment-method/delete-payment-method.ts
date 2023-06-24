import {GetPaymentMethodOptions} from "./get-payment-method";
import {getPaymentMethodStore} from "./store";

export async function deletePaymentMethod(options?: GetPaymentMethodOptions) {
    const store = getPaymentMethodStore(options);
    return store.delete(options.paymentMethodId);
}