import {Order, OrderStatus} from "./types";
import { getOrderStore } from "./store";

export interface ListOrdersInput {
  status?: OrderStatus;
}

export async function listOrders({ status }: ListOrdersInput = {}): Promise<
  Order[]
> {
  const store = getOrderStore();
  let values = await store.values();
  if (status) {
    values = values.filter(value => value.status === status);
  }
  return values.sort((a, b) => new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime() ? -1 : 1)
}
