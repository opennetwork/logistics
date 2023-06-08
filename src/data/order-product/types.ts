import {Identifier} from "../identifier";

export interface OrderProductIdentifierData {
  productId: string;
  quantity?: number; // Default 1
  identifiers?: Identifier[]; // Default []
}

export interface OrderProductData extends OrderProductIdentifierData {
  orderId: string;
}

export interface OrderProduct extends OrderProductData {
  orderProductId: string;
  createdAt: string;
  updatedAt: string;
}

export type SetOrderProduct = OrderProductData & Pick<OrderProduct, "orderId" | "orderProductId"> & Partial<OrderProduct>;