import {OrderProductIdentifierData, OrderProduct} from "../order-product";

export type OrderStatus = "pending" | "submitted" | "processing" | "complete";

export interface OrderData {
  status: OrderStatus;
  products?: (OrderProductIdentifierData & Partial<OrderProduct>)[];
}

export interface Order extends OrderData {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}
