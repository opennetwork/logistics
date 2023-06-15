import {FastifyPluginAsync, FastifyRequest} from "fastify";
import {FunctionComponent} from "react";
import {LogisticsConfig} from "../config/types";

export interface ViewUnknownFn {
    (...args: unknown[]): (void | unknown | Promise<unknown | void>)
}

export interface View {
    path: string;
    anonymous?: boolean;
    cached?: boolean;
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


declare global {
    interface ApplicationConfig extends ViewConfig {

    }
}