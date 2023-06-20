import { getKeyValueStore } from "../kv";
import { PaymentMethod } from "./types";

const STORE_NAME = "paymentMethod" as const;

export function getPaymentMethodStore() {
  return getKeyValueStore<PaymentMethod>(STORE_NAME, {
    counter: true
  });
}
