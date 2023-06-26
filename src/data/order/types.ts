import type {OrderItemIdentifierData, OrderItem, OrderProductItem} from "../order-item";
import type {ShipmentFrom, ShipmentTo} from "../shipment";
import type {PaymentMethodData} from "../payment-method";
import {OfferPrice, TotalOfferPrice} from "../offer";

export type OrderStatus = "pending" | "submitted" | "processing" | "complete";

export interface OrderData {
  status: OrderStatus;
  reference?: string;
  to?: ShipmentTo;
  // Is it from a specific known location?
  from?: ShipmentFrom;
  // Partial in progress payment data, before the payment method is created or matched
  paymentMethod?: Partial<PaymentMethodData>
  paymentId?: string;
  paymentMethodId?: string;
}

export interface Order extends OrderData, Partial<TotalOfferPrice> {
  orderId: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  products?: OrderProductItem[];
}
