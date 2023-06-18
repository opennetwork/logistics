import { PaymentMethod } from "./types";
import { getPaymentMethodStore } from "./store";

export interface ListPaymentMethodsInput {}

export async function listPaymentMethods({}: ListPaymentMethodsInput = {}): Promise<
  PaymentMethod[]
> {
  const store = getPaymentMethodStore();
  return store.values();
}
