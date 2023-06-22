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
  additionalProperties: false,
  required: [
      "type",
      "productId"
  ]
}

export const offerItem = {
  type: "object",
  properties: {},
  additionalProperties: true,
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
    },
    price: {
      type: "string",
      nullable: true
    },
    currency: {
      type: "string",
      nullable: true
    },
    currencyCode: {
      type: "string",
      nullable: true
    },
    countryCode: {
      type: "string",
      nullable: true
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
