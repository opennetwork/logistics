import {Identifier} from "../identifier";

export interface InventoryProduct {
  productId: string;
  quantity: number;
  identifiers: Identifier[];
}

export interface InventoryData {
  products: InventoryProduct[];
}

export interface Inventory extends InventoryData {
  inventoryId: string;
  createdAt: string;
  updatedAt: string;
}
