export const productData = {
  type: "object",
  properties: {
    productName: {
      type: "string",
    }
  },
  required: ["productName"],
} as const;

export const product = {
  type: "object",
  properties: {
    productId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...productData.properties,
  },
  required: ["productId", "createdAt", "updatedAt", ...productData.required],
} as const;
