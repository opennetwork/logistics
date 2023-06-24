import {FastifyPluginAsync} from "fastify";
import type {ReactOrderConfig} from "../react/server/paths/order/types";
import type {ViewConfig} from "../view";
import type {AuthenticationRoleConfig} from "../data";

export interface LogisticsConfig {
    routes?: FastifyPluginAsync
}

export interface Config extends LogisticsConfig, ReactOrderConfig, ViewConfig, Partial<AuthenticationRoleConfig> {

}
