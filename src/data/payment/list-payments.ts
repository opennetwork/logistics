import { Payment } from "./types";
import { getPaymentStore } from "./store";

export interface ListPaymentsInput {}

export async function listPayments({}: ListPaymentsInput = {}): Promise<
  Payment[]
> {
  const store = getPaymentStore();
  return store.values();
}
