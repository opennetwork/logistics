import { getPaymentMethodStore } from "./store";

export function getPaymentMethod(id: string) {
  const store = getPaymentMethodStore();
  return store.get(id);
}
