import { Order, OrderData } from "./types";
import { getOrderStore } from "./store";
import { setOrderProducts } from "../order-product";
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
    products: undefined,
    updatedAt,
  };
  await store.set(data.orderId, document);
  if (data.products) {
    await setOrderProducts(data.products.map(product => ({
      ...product,
      orderId: data.orderId,
      orderProductId: product.orderProductId || v4()
    })));
  }
  return document;
}