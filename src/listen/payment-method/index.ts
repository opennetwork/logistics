import {FastifyInstance} from "fastify";
import {deletePaymentMethodRoutes} from "./delete-payment-method";

export async function paymentMethodRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(deletePaymentMethodRoutes);
    }

    fastify.register(routes, {
        prefix: "/payments/methods"
    });

}