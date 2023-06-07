import { Inventory } from "./types";
import { getInventoryStore } from "./store";

export interface ListInventoryInput {}

export async function listInventory({}: ListInventoryInput = {}): Promise<
  Inventory[]
> {
  const store = getInventoryStore();
  return store.values();
}
