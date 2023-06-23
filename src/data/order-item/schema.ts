import { identifierSchema } from "../identifier";

export const orderItemData = {
  type: "object",
  properties: {
    offerId: {
      type: "string",
      nullable: true
    },
    productId: {
      type: "string",
      nullable: true
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
  }
}

export const orderItem = {
  type: "object",
  properties: {
    orderItemId: {
      type: "string"
    },
    createdAt: {
      type: "string"
    },
    updatedAt: {
      type: "string"
    },
    ...orderItemData.properties,
  },
  required: ["orderItemId", "quantity", "identifiers"]
}

export const orderProductItem = {
  type: "object",
  properties: {
    ...orderItem.properties,
    productId: {
      type: "string"
    }
  },
  required: [...orderItem.required, "productId"]
}