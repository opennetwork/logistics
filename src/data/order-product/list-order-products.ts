import { OrderProduct } from "./types";
import { getOrderProductStore } from "./store";

export async function listOrderProducts(orderId: string): Promise<
    OrderProduct[]
> {
  const store = getOrderProductStore(orderId);
  return store.values();
}
