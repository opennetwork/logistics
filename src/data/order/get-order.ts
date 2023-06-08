import { getOrderStore } from "./store";
import { listOrderProducts } from "../order-product";

export async function getOrder(id: string) {
  const store = getOrderStore();
  const order = await store.get(id);
  if (!order) return undefined;
  return {
    ...order,
    products: await listOrderProducts(order.orderId)
  }
}
