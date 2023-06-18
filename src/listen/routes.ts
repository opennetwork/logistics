import {FastifyInstance} from "fastify";
import {viewRoutes} from "../view";
import {backgroundRoutes} from "./background";
import {systemLogRoutes} from "./system-log";
import {partnerRoutes} from "./partner";
import {authenticationRoutes} from "./auth";
import {productRoutes} from "./product";
import {fileRoutes} from "./file";
import {offerRoutes} from "./offer";

export async function routes(fastify: FastifyInstance) {

    async function apiRoutes(fastify: FastifyInstance) {
        fastify.register(systemLogRoutes);
        fastify.register(partnerRoutes);
        fastify.register(productRoutes);
        fastify.register(offerRoutes);
        fastify.register(fileRoutes);
    }

    fastify.register(apiRoutes, {
        prefix: "/api/version/1"
    });

    fastify.register(authenticationRoutes, {
        prefix: "/api"
    });

    fastify.register(backgroundRoutes, {
        prefix: "/api"
    });

    fastify.register(viewRoutes);
}