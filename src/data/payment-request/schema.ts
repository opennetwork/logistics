export const paymentRequestType = {
  type: "string",
  enum: [
    "invoice",
    "realtime"
  ]
}

export const paymentRequestStatus = {
  type: "string",
  enum: [
      "pending",
      "accepted",
      "expired",
      "void"
  ]
}

export const paymentRequestData = {
  type: "object",
  properties: {
    type: {
      type: "array",
      items: paymentRequestType,
      nullable: true
    },
    status: paymentRequestStatus,
  },
  required: ["status"],
} as const;

export const paymentRequest = {
  type: "object",
  properties: {
    type: {
      type: "array",
      items: paymentRequestType
    },
    paymentRequestId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...paymentRequestData.properties,
  },
  required: ["type", "paymentRequestId", "createdAt", "updatedAt", ...paymentRequestData.required],
} as const;
