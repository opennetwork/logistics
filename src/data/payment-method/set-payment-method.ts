import { PaymentMethod, PaymentMethodData } from "./types";
import { getPaymentMethodStore } from "./store";

export async function setPaymentMethod(
  data: PaymentMethodData & Pick<PaymentMethod, "paymentMethodId"> & Partial<PaymentMethod>
): Promise<PaymentMethod> {
  const store = await getPaymentMethodStore();
  const updatedAt = new Date().toISOString();
  const document: PaymentMethod = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    updatedAt,
  };
  await store.set(data.paymentMethodId, document);
  return document;
}