export const paymentStatus = {
  type: "string",
  enum: [
      "pending",
      "processing",
      "paid",
      "void"
  ]
}

export const paymentData = {
  type: "object",
  properties: {
    status: paymentStatus,
  },
  required: ["status"],
} as const;

export const payment = {
  type: "object",
  properties: {
    paymentId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...paymentData.properties,
  },
  required: ["paymentId", "createdAt", "updatedAt", ...paymentData.required],
} as const;
