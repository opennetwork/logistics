import { getPaymentStore } from "./store";

export function getPayment(id: string) {
  const store = getPaymentStore();
  return store.get(id);
}
