import {Inventory, InventoryType} from "./types";
import { getInventoryStore } from "./store";

export interface ListInventoryInput {
  type?: InventoryType
}

export async function listInventory({ type = "inventory" }: ListInventoryInput = {}): Promise<
  Inventory[]
> {
  const store = getInventoryStore();
  let values = await store.values();
  if (type) {
    values = values.filter(value => value.type === type);
  }
  return values;
}
