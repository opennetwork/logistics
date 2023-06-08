import { Inventory, InventoryData } from "./types";
import { getInventoryStore } from "./store";
import {v4} from "uuid";
import {SetInventoryProduct, setInventoryProducts} from "../inventory-product";

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
  if (data.products) {
    await setInventoryProducts(data.products.map((product): SetInventoryProduct => ({
      ...product,
      inventoryId: data.inventoryId,
      inventoryProductId: product.inventoryProductId || v4()
    })));
  }
  return document;
}