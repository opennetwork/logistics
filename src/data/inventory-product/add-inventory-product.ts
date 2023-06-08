import { v4 } from "uuid";
import { InventoryProduct, InventoryProductData } from "./types";
import {setInventoryProduct, setInventoryProducts} from "./set-inventory-products";

export async function addInventoryProduct(data: InventoryProductData): Promise<InventoryProduct> {
  return setInventoryProduct({
    ...data,
    inventoryProductId: v4()
  });
}

export async function addInventoryProducts(data: InventoryProductData[]): Promise<InventoryProduct[]> {
  return setInventoryProducts(data.map(data => ({
    ...data,
    inventoryProductId: v4()
  })));
}
