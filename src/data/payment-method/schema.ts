export const paymentMethodStatus = {
  type: "string",
  enum: [
      "pending",
      "available",
      "expired",
      "void"
  ]
}

export const paymentMethodData = {
  type: "object",
  properties: {
    status: paymentMethodStatus,
  },
  required: ["status"],
} as const;

export const paymentMethod = {
  type: "object",
  properties: {
    paymentMethodId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...paymentMethodData.properties,
  },
  required: ["paymentMethodId", "createdAt", "updatedAt", ...paymentMethodData.required],
} as const;
