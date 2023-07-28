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
    status: {
      ...paymentRequestStatus,
      nullable: true
    },
  }
} as const;

export const paymentRequest = {
  type: "object",
  properties: {
    ...paymentRequestData.properties,
    type: {
      type: "array",
      items: paymentRequestType
    },
    status: paymentRequestStatus,
    paymentRequestId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  required: ["type", "paymentRequestId", "createdAt", "updatedAt", "status"],
} as const;