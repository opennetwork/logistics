import {Identifier} from "../identifier";

export interface OrderProduct {
  productId: string;
  quantity: number;
  identifiers: Identifier[];
}

export type OrderStatus = "pending" | "submitted" | "processing" | "complete";

export interface OrderData {
  status: OrderStatus;
  products: OrderProduct[];
}

export interface Order extends OrderData {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}
