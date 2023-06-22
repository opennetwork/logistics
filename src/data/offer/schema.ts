import { identifierSchema } from "../identifier";

export const productOfferItem = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [
          "product"
      ]
    },
    productId: {
      type: "string"
    },
    quantity: {
      type: "number",
      nullable: true
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier,
      nullable: true
    }
  },
  required: [
      "type"
  ]
}

export const offerItem = {
  type: "object",
  oneOf: [
      productOfferItem
  ]
}

export const offerStatus = {
  type: "string",
  enum: [
    "speculative",
    "preSale",
    "preOrder",
    "onlineOnly",
    "storeOnly",
    "available",
    "backOrder",
    "limitedAvailability",
    "soldOut",
    "void"
  ]
}

export const offerData = {
  type: "object",
  properties: {
    status: offerStatus,
    items: {
      type: "array",
      items: offerItem
    },
    organisationId: {
      type: "string",
      nullable: true,
    },
    offerName: {
      type: "string",
      nullable: true,
    },
    public: {
      type: "boolean",
      nullable: true,
    }
  },
  required: ["status", "items"],
} as const;

export const offer = {
  type: "object",
  properties: {
    offerId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...offerData.properties,
  },
  required: ["offerId", "createdAt", "updatedAt", ...offerData.required],
} as const;
