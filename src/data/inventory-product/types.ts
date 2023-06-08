import {Identifier} from "../identifier";

export interface InventoryProductIdentifierData {
  productId: string;
  quantity?: number; // Default 1
  identifiers?: Identifier[]; // Default []
}

export interface InventoryProductData extends InventoryProductIdentifierData {
  inventoryId: string;
}

export interface InventoryProduct extends InventoryProductData {
  inventoryProductId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetInventoryProduct = InventoryProductData & Pick<InventoryProduct, "inventoryId" | "inventoryProductId"> & Partial<InventoryProduct>;