import {FastifyPluginAsync, FastifyRequest} from "fastify";
import {FunctionComponent} from "react";

export interface ViewUnknownFn {
    (...args: unknown[]): (void | unknown | Promise<unknown | void>)
}

export interface View {
    path: string;
    anonymous?: boolean;
    cached?: boolean;
    deferHandlerWhenSubmit?: boolean;
    handler?: ViewUnknownFn;
    submit?: ViewUnknownFn;
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