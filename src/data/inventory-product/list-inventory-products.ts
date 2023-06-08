import { InventoryProduct } from "./types";
import { getInventoryProductStore } from "./store";

export async function listInventoryProducts(inventoryId: string): Promise<
    InventoryProduct[]
> {
  const store = getInventoryProductStore(inventoryId);
  return store.values();
}
