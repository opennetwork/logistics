import {getInventoryProductStore} from "./store";
import {InventoryProduct, SetInventoryProduct} from "./types";
import {v4} from "uuid";

export async function setInventoryProduct(data: SetInventoryProduct): Promise<InventoryProduct> {
  const store = await getInventoryProductStore(data.inventoryId);
  const updatedAt = new Date().toISOString();
  const inventoryProductId = data.inventoryProductId || v4();
  const document: InventoryProduct = {
    createdAt: data.createdAt || updatedAt,
    ...data,
    quantity: data.quantity ?? 1, // Notice ?? use
    identifiers: data.identifiers ?? [],
    updatedAt,
    inventoryProductId,
  };
  await store.set(inventoryProductId, document);
  return document;
}

export async function setInventoryProducts(products: SetInventoryProduct[]): Promise<InventoryProduct[]> {
  const result: InventoryProduct[] = [];
  // Add in serial... it's not needing to be fast right now
  for (const data of products) {
    result.push(await setInventoryProduct(data));
  }
  return result;
}