import { getKeyValueStore } from "../kv";
import { Payment } from "./types";

const STORE_NAME = "payment" as const;

export function getPaymentStore() {
  return getKeyValueStore<Payment>(STORE_NAME, {
    counter: true
  });
}
