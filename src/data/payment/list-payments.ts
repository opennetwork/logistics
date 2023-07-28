import { Payment } from "./types";
import { getPaymentStore } from "./store";
import {PaymentMethodIdentifier} from "../payment-method";

export interface ListPaymentsInput extends PaymentMethodIdentifier {

}

export async function listPayments(input: ListPaymentsInput): Promise<Payment[]> {
  const store = getPaymentStore(input);
  return store.values();
}
