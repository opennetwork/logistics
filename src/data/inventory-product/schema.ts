import { identifierSchema } from "../identifier";

export const inventoryProduct = {
  type: "object",
  properties: {
    productId: {
      type: "string"
    },
    quantity: {
      type: "number"
    },
    identifiers: {
      type: "array",
      items: identifierSchema.identifier
    }
  },
  required: ["productId", "quantity", "identifiers"]
}