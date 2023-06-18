export type PaymentMethodStatus = "pending" | "available" | "expired" | "void";

export interface PaymentMethodData extends Record<string, unknown> {
  status: PaymentMethodStatus;
}

export interface PaymentMethod extends PaymentMethodData {
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}
