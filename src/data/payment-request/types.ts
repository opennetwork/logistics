import { ShipmentTo } from "../shipment";

export type PaymentRequestType =
    | "invoice"
    | "realtime";

export type PaymentRequestStatus = "pending" | "accepted" | "expired" | "void";

export interface PaymentRequestOwnerIdentifiers {
  userId?: string;
  organisationId?: string;
}

export interface PaymentRequestIdentifier extends PaymentRequestOwnerIdentifiers {
  paymentRequestId: string;
}

export interface PaymentRequestData extends Record<string, unknown>, PaymentRequestOwnerIdentifiers {
  status: PaymentRequestStatus;
  types: PaymentRequestType[];
  paymentMethodId?: string;
  to?: ShipmentTo;
}

export interface PaymentRequest extends PaymentRequestData, PaymentRequestIdentifier {
  createdAt: string;
  updatedAt: string;
}
