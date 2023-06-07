export const shipmentLocation = {
  type: "object",
  properties: {
    locationId: {
      type: "string",
      nullable: true
    },
    address: {
      type: "array",
      items: {
        type: "string"
      },
      nullable: true
    },
    countryCode: {
      type: "string",
      nullable: true
    }
  }
}

export const shipmentFrom = {
  ...shipmentLocation
};

export const shipmentTo = {
  ...shipmentLocation
};

export const shipmentStatus = {
  type: "string",
  enum: [
      "pending",
      "processing",
      "sent",
      "delivered"
  ]
}

export const shipmentData = {
  type: "object",
  properties: {
    status: shipmentStatus,
    from: {
      ...shipmentFrom,
      nullable: true
    },
    to: shipmentTo
  },
  required: ["status", "to"],
} as const;

export const shipment = {
  type: "object",
  properties: {
    shipmentId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...shipmentData.properties,
  },
  required: ["shipmentId", "createdAt", "updatedAt", ...shipmentData.required],
} as const;
