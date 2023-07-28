import { getKeyValueStore } from "../kv";
import { PaymentRequest, PaymentRequestOwnerIdentifiers } from "./types";

const STORE_NAME = "paymentRequest" as const;

export function getUserPaymentRequestStore(userId: string) {
  return getKeyValueStore<PaymentRequest>(STORE_NAME, {
    counter: true,
    prefix: `userId::${userId}`
  });
}

export function getOrganisationPaymentRequestStore(organisationId: string) {
  return getKeyValueStore<PaymentRequest>(STORE_NAME, {
    counter: true,
    prefix: `organisationId::${organisationId}`
  });
}

export function getPaymentRequestStore(data: PaymentRequestOwnerIdentifiers) {
  if (data.organisationId) {
    return getOrganisationPaymentRequestStore(data.organisationId);
  }
  if (data.userId) {
    return getUserPaymentRequestStore(data.userId);
  }
  throw new Error("Expected organisationId or userId for paymentRequest")
}