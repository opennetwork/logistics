import { getKeyValueStore } from "../kv";
import { Payment } from "./types";
import {PaymentMethodIdentifier} from "../payment-method";

const STORE_NAME = "payment" as const;

export function getPaymentStore({ paymentMethodId }: PaymentMethodIdentifier) {
  return getKeyValueStore<Payment>(STORE_NAME, {
    counter: true,
    prefix: `paymentMethod::${paymentMethodId}`
  });
}
