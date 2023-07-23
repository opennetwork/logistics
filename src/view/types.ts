import {FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {FunctionComponent} from "react";

type UnknownResult = void | unknown | Promise<unknown | void>
export interface HandlerFn {
    (request: FastifyRequest, response: FastifyReply, data?: unknown): UnknownResult;
}

export interface View {
    path: string;
    anonymous?: boolean;
    cached?: boolean;
    deferHandlerWhenSubmit?: boolean;
    handler?: HandlerFn;
    submit?: HandlerFn;
    Component: FunctionComponent;
}

export interface PartialView extends Partial<View> {
    path: string;
}

export interface ViewConfig {
    views?: View[];
    Component?: FunctionComponent
    routes?: FastifyPluginAsync
}