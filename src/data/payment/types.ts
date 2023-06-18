export type PaymentType =
    | "invoice"
    | "realtime";
export type PaymentStatus = "pending" | "processing" | "paid" | "void";

export interface PaymentData extends Record<string, unknown> {
  type: PaymentType;
  status: PaymentStatus;
  paymentMethodId: string;
  reference?: string;
}

export interface Payment extends PaymentData {
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}
