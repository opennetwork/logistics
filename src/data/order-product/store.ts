import { getKeyValueStore } from "../kv";
import { OrderProduct } from "./types";

const STORE_NAME = "orderProduct" as const;

export function getOrderProductStore(orderId: string) {
  return getKeyValueStore<OrderProduct>(STORE_NAME, {
    // Partition by orderId
    prefix: `orderId::${orderId}::`
  });
}