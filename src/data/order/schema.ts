import { shipmentSchema } from "../shipment";
import {orderItem, orderItemData, orderProductItem} from "../order-item/schema";

export const orderData = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: orderItemData,
      nullable: true
    },
    to: {
      ...shipmentSchema.shipmentTo,
      nullable: true
    }
  },
};

export const order = {
  type: "object",
  properties: {
    orderId: {
      type: "string",
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    ...orderData.properties,
    items: {
      type: "array",
      items: orderItem,
      nullable: true
    },
    products: {
      type: "array",
      items: orderProductItem,
      nullable: true
    },
  },
  required: ["orderId", "createdAt", "updatedAt"],
} as const;
