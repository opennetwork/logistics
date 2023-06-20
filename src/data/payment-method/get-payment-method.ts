import { getPaymentMethodStore } from "./store";
import {PaymentMethodOwnerIdentifiers} from "./types";

export interface GetPaymentMethodOptions extends PaymentMethodOwnerIdentifiers {
  paymentMethodId: string;
}

export function getPaymentMethod(options: GetPaymentMethodOptions) {
  const store = getPaymentMethodStore(options);
  return store.get(options.paymentMethodId);
}
