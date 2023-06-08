import {InventoryProduct, InventoryProductIdentifierData} from "../inventory-product";

export interface InventoryData {
  products: (InventoryProductIdentifierData & Partial<InventoryProduct>)[];
}

export interface Inventory extends InventoryData {
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
}
