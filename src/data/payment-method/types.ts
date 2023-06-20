export type PaymentMethodType =
    | "invoice"
    | "realtime";

export type PaymentMethodStatus = "pending" | "available" | "expired" | "void";

export interface PaymentMethodOwnerIdentifiers {
  userId?: string;
  organisationId?: string;
}

export interface PaymentMethodData extends Record<string, unknown>, PaymentMethodOwnerIdentifiers {
  status: PaymentMethodStatus;
  type: PaymentMethodType;
  paymentMethodName?: string;
  issuerName?: string;
  issuerId?: string;
  issuerPaymentMethodId?: string;
}

export interface PaymentMethod extends PaymentMethodData {
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}
