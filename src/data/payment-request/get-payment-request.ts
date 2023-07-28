import { getPaymentRequestStore } from "./store";
import { PaymentRequestIdentifier } from "./types";

export function getPaymentRequest(options: PaymentRequestIdentifier) {
  const store = getPaymentRequestStore(options);
  return store.get(options.paymentRequestId);
}
