import { identifierSchema } from "../identifier";
import { shipmentSchema } from "../shipment";

export const orderProduct = {
  type: "object",
  properties: {
    productId: {
      type: "string"
    },
    quantity: {
      type: "number"
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier
    }
  },
  required: ["productId", "quantity", "identifiers"]
}

export const orderData = {
  type: "object",
  properties: {
    products: {
      type: "array",
      items: orderProduct,
      nullable: true
    },
    to: {
      ...shipmentSchema.shipmentTo,
      nullable: true
    }
  },
  required: [
  ],
} as const;

export const order = {
  type: "object",
  properties: {
    orderId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...orderData.properties,
  },
  required: ["orderId", "createdAt", "updatedAt", ...orderData.required],
} as const;
