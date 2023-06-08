import { getKeyValueStore } from "../kv";
import { InventoryProduct } from "./types";

const STORE_NAME = "inventoryProduct" as const;

export function getInventoryProductStore(inventoryId: string) {
  return getKeyValueStore<InventoryProduct>(STORE_NAME, {
    // Partition by inventoryId
    prefix: `inventoryId::${inventoryId}::`
  });
}