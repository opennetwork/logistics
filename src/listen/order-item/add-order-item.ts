import { FastifyInstance } from "fastify";
import {addOrderItem, getOrder, OrderItemData, orderItemSchema} from "../../data";
import { authenticate } from "../authentication";
import {getMaybePartner, getMaybeUser} from "../../authentication";

export async function addOrderItemRoutes(fastify: FastifyInstance) {

  type Params = {
    orderId: string
  }

  type Schema = {
    Params: Params
    Body: OrderItemData;
  };

  const response = {
    201: {
      description: "A new order item",
      ...orderItemSchema.orderItem,
    },
  };

  const schema = {
    description: "Add a new order item",
    tags: ["order item"],
    summary: "",
    body: orderItemSchema.orderItemData,
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  try {
    fastify.post<Schema>("/", {
      schema,
      preHandler: authenticate(fastify),
      async handler(request, response) {
        const order = await getOrder(request.params.orderId, {
          userId: getMaybeUser()?.userId,
          organisationId: getMaybePartner()?.organisationId
        });
        if (!order) {
          response.status(404);
          response.send();
          return;
        }
        const orderItem = await addOrderItem({
          ...request.body,
          orderId: request.params.orderId
        });
        response.status(201);
        response.send(orderItem);
      },
    });
  } catch {}
}
