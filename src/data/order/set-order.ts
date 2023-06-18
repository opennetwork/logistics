import { Order, OrderData } from "./types";
import { getOrderStore } from "./store";
import {setOrderItems} from "../order-item";
import {v4} from "uuid";

export async function setOrder(
  data: OrderData & Pick<Order, "orderId"> & Partial<Order>
): Promise<Order> {
  const store = await getOrderStore();
  const updatedAt = new Date().toISOString();
  const document: Order = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    // Don't store the products on the order itself
    items: undefined,
    updatedAt,
  };
  await store.set(data.orderId, document);
  if (data.items) {
    await setOrderItems(data.items.map(product => ({
      ...product,
      orderId: data.orderId,
      orderItemId: product.orderItemId || v4()
    })));
  }
  return document;
}