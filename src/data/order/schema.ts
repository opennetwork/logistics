import { identifierSchema } from "../identifier";

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
      items: orderProduct
    }
  },
  required: [
    "products"
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
