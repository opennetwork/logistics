import {OrderItemIdentifierData, OrderItem} from "../order-item";
import {ShipmentFrom, ShipmentTo} from "../shipment";

export type OrderStatus = "pending" | "submitted" | "processing" | "complete";

export interface OrderData {
  status: OrderStatus;
  reference?: string;
  items?: (OrderItemIdentifierData & Partial<OrderItem>)[];
  to?: ShipmentTo;
  from?: ShipmentFrom; // Is it from a specific known location?
  paymentId?: string;
  paymentMethodId?: string;
}

export interface Order extends OrderData {
  orderId: string;
  createdAt: string;
  updatedAt: string;
}
