import { Order, OrderData } from "./types";
import { getOrderStore } from "./store";

export async function setOrder(
  data: OrderData & Pick<Order, "orderId"> & Partial<Order>
): Promise<Order> {
  const store = await getOrderStore();
  const updatedAt = new Date().toISOString();
  const document: Order = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    updatedAt,
  };
  await store.set(data.orderId, document);
  return document;
}