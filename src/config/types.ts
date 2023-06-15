import {FastifyPluginAsync} from "fastify";

export interface LogisticsConfig {
    routes?: FastifyPluginAsync
}

declare global {
    interface ApplicationConfig extends LogisticsConfig {

    }
}

export type Config = ApplicationConfig;
