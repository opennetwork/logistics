import {Identifier} from "../identifier";
import {ShipmentFrom, ShipmentTo} from "../shipment";

export type InventoryProductStatus =
    | "pending"
    | "available"
    | "processing"
    | "split"
    | "void";

export interface InventoryProductIdentifierData {
  productId: string;
  quantity?: number; // Default 1
  identifiers?: Identifier[]; // Default []
}

export interface InventoryProductData extends InventoryProductIdentifierData {
  inventoryId: string;
  status?: InventoryProductStatus;
  // Record where it came from and was sent to
  from?: ShipmentFrom;
  to?: ShipmentTo | ShipmentTo[];
}

export interface InventoryProduct extends InventoryProductData {
  inventoryProductId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetInventoryProduct = InventoryProductData & Pick<InventoryProduct, "inventoryId" | "inventoryProductId"> & Partial<InventoryProduct>;