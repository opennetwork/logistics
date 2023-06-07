import { Inventory, InventoryData } from "./types";
import { getInventoryStore } from "./store";

export async function setInventory(
  data: InventoryData & Pick<Inventory, "inventoryId"> & Partial<Inventory>
): Promise<Inventory> {
  const store = await getInventoryStore();
  const updatedAt = new Date().toISOString();
  const document: Inventory = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    updatedAt,
  };
  await store.set(data.inventoryId, document);
  return document;
}