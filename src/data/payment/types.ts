import {PaymentMethodIdentifier} from "../payment-method";

export type PaymentType =
    | "invoice"
    | "realtime";
export type PaymentStatus = "pending" | "processing" | "paid" | "void";

export interface PaymentData extends PaymentMethodIdentifier, Record<string, unknown> {
  type: PaymentType;
  status: PaymentStatus;
  reference?: string;
  userId?: string;
  organisationId?: string;
}

export interface PaymentIdentifier extends PaymentMethodIdentifier {
  paymentId: string;
}

export interface Payment extends PaymentIdentifier, PaymentData {
  createdAt: string;
  updatedAt: string;
}

