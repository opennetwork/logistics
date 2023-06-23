import { FastifyInstance } from "fastify";
import {addOrderItem, getOffer, getOrder, getProduct, OrderItemData, orderItemSchema} from "../../data";
import { authenticate } from "../authentication";
import {getMaybePartner, getMaybeUser} from "../../authentication";

export async function addOrderItemRoutes(fastify: FastifyInstance) {

  type Querystring = {
    redirect?: string;
  }

  type OrderParams = {
    orderId: string
  }

  const response = {
    201: {
      description: "A new order item",
      ...orderItemSchema.orderItem,
    },
  };

  try {

    type Schema = {
      Querystring: Querystring
      Params: OrderParams
      Body: OrderItemData;
    };

    const params = {
      type: "object",
      properties: {
        orderId: {
          type: "string"
        }
      },
      required: ["orderId"]
    };

    const schema = {
      description: "Add a new order item",
      tags: ["order item"],
      summary: "",
      body: orderItemSchema.orderItemData,
      response,
      params,
      security: [
        {
          apiKey: [] as string[],
        },
      ],
    };
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
        const { redirect } = request.query;
        if (redirect) {
          const url = redirect.replace(":orderItemId", orderItem.orderItemId);
          response.header("Location", url);
          response.status(302);
          response.send();
          return;
        }
        response.status(201);
        response.send(orderItem);
      },
    });
  } catch {}

  try {
    type Params = OrderParams & {
      offerId: string;
    }

    type Schema = {
      Querystring: Querystring
      Params: Params
      Body: OrderItemData;
    };

    const params = {
      type: "object",
      properties: {
        orderId: {
          type: "string"
        },
        offerId: {
          type: "string"
        }
      },
      required: ["orderId", "offerId"]
    };

    const schema = {
      description: "Add a new order item",
      tags: ["order item"],
      summary: "",
      body: orderItemSchema.orderItemData,
      response,
      params,
      security: [
        {
          apiKey: [] as string[],
        },
      ],
    };
    fastify.post<Schema>("/offers/:offerId", {
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
        const offer = await getOffer(request.params.offerId)
        if (!offer) {
          response.status(404);
          response.send();
          return;
        }
        const orderItem = await addOrderItem({
          ...request.body,
          productId: undefined,
          offerId: offer.offerId,
          orderId: request.params.orderId
        });
        const { redirect } = request.query;
        if (redirect) {
          const url = redirect.replace(":orderItemId", orderItem.orderItemId);
          response.header("Location", url);
          response.status(302);
          response.send();
          return;
        }
        response.status(201);
        response.send(orderItem);
      },
    });
  } catch {}


  try {
    type Params = OrderParams & {
      productId: string;
    }

    type Schema = {
      Querystring: Querystring;
      Params: Params;
      Body: OrderItemData;
    };

    const params = {
      type: "object",
      properties: {
        orderId: {
          type: "string"
        },
        productId: {
          type: "string"
        }
      },
      required: ["orderId", "productId"]
    };

    const schema = {
      description: "Add a new order item",
      tags: ["order item"],
      summary: "",
      body: orderItemSchema.orderItemData,
      response,
      params,
      security: [
        {
          apiKey: [] as string[],
        },
      ],
    };
    fastify.post<Schema>("/products/:productId", {
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
        const product = await getProduct(request.params.productId)
        if (!product) {
          response.status(404);
          response.send();
          return;
        }
        const orderItem = await addOrderItem({
          ...request.body,
          offerId: undefined,
          productId: product.productId,
          orderId: request.params.orderId
        });
        const { redirect } = request.query;
        if (redirect) {
          const url = redirect.replace(":orderItemId", orderItem.orderItemId);
          response.header("Location", url);
          response.status(302);
          response.send();
          return;
        }
        response.status(201);
        response.send(orderItem);
      },
    });
  } catch {}
}
