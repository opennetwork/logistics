export const fileSize = {
  type: "object",
  properties: {
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    url: {
      type: "string"
    },
    watermark: {
      type: "boolean",
      nullable: true
    },
    signed: {
      type: "boolean",
      nullable: true
    },
    expiresAt: {
      type: "string",
      nullable: true
    },
    fileName: {
      type: "string",
      nullable: true
    }
  },
  additionalProperties: false,
  required: [
    "width",
    "height",
    "url"
  ]
}

export const fileData = {
  type: "object",
  properties: {
    fileName: {
      type: "string"
    },
    contentType: {
      type: "string"
    },
    size: {
      type: "number",
      nullable: true
    },
    url: {
      type: "string",
      nullable: true
    },
    source: {
      type: "string",
      nullable: true
    },
    synced: {
      type: "string",
      nullable: true
    },
    syncedAt: {
      type: "string",
      nullable: true
    },
    version: {
      type: "number",
      nullable: true
    },
    type: {
      type: "string",
      nullable: true
    },
    pinned: {
      type: "boolean",
      nullable: true
    },
    sizes: {
      type: "array",
      nullable: true,
      items: fileSize
    },
    uploadedAt: {
      type: "string",
      nullable: true
    },
    uploadedByUsername: {
      type: "string",
      nullable: true
    },
    signed: {
      type: "boolean",
      nullable: true
    },
    expiresAt: {
      type: "string",
      nullable: true
    },
    productId: {
      type: "string",
      nullable: true
    },
    offerId: {
      type: "string",
      nullable: true
    },
    orderId: {
      type: "string",
      nullable: true
    },
    orderItemId: {
      type: "string",
      nullable: true
    },
    inventoryId: {
      type: "string",
      nullable: true
    },
    inventoryItemId: {
      type: "string",
      nullable: true
    },
    reactionCounts: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  },
  additionalProperties: false,
  required: [
    "fileName",
    "contentType"
  ],
} as const;

export const file = {
  type: "object",
  properties: {
    fileId: {
      type: "string",
    },
    ...fileData.properties,
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
  additionalProperties: false,
  required: [...fileData.required, "fileId", "createdAt", "updatedAt"],
} as const;
