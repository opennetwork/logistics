import { getOrderStore } from "./store";

export function getOrder(id: string) {
  const store = getOrderStore();
  return store.get(id);
}
