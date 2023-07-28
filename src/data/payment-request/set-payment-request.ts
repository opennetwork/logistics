import { PaymentRequest, PaymentRequestData } from "./types";
import { getPaymentRequestStore } from "./store";
import { v4 } from "uuid";

export async function setPaymentRequest(
  data: PaymentRequestData & Partial<PaymentRequest>
): Promise<PaymentRequest> {
  const store = await getPaymentRequestStore(data);
  const updatedAt = new Date().toISOString();
  const paymentRequestId = data.paymentRequestId || v4()
  const document: PaymentRequest = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    paymentRequestId,
    updatedAt,
  };
  await store.set(data.paymentRequestId, document);
  return document;
}