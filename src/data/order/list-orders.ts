import { Order } from "./types";
import { getOrderStore } from "./store";

export interface ListOrdersInput {}

export async function listOrders({}: ListOrdersInput = {}): Promise<
  Order[]
> {
  const store = getOrderStore();
  return store.values();
}
