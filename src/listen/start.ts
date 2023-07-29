import fastify, {FastifyInstance} from "fastify";
import { routes } from "./routes";
import { setupSwagger } from "./swagger";
import blippPlugin from "fastify-blipp";
import corsPlugin from "@fastify/cors";
import { getPort } from "./config";
import { fastifyRequestContext } from "@fastify/request-context";
import helmet from "@fastify/helmet";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { bearerAuthentication } from "./authentication";
import bearerAuthPlugin from "@fastify/bearer-auth";
import authPlugin from "@fastify/auth";
import { autoSeed, seed, stopData } from "../data";
import {commitAt, commitShort, importmapRoot, importmapRootName, packageIdentifier} from "../package";
import cookie from "@fastify/cookie";
import { isLike, ok } from "../is";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody";
import qs from "qs";
import { REACT_CLIENT_DIRECTORY } from "../view";
import files from "@fastify/static";
import { errorHandler } from "../view/error";
import etag from "@fastify/etag";
import { parseStringFields } from "./body-parser";
import {Config, getConfig, setConfig, withConfig} from "../config";

const { pathname } = new URL(import.meta.url);
const directory = dirname(pathname);

export async function createFastifyApplication() {
    const { COOKIE_SECRET, PUBLIC_PATH } = process.env;

    ok(COOKIE_SECRET, "Expected COOKIE_SECRET");

    const app = fastify({
        logger: true,
    });

    const register: (...args: unknown[]) => void = app.register.bind(fastify);

    register(cookie, {
        secret: COOKIE_SECRET,
        hook: "onRequest",
        parseOptions: {},
    });

    register(multipart);
    register(formbody, {
        parser: parseStringFields,
    });

    register(helmet, { contentSecurityPolicy: false });

    app.addHook("preValidation", async (request, response) => {
        if (request.headers.apikey && !request.headers.authorization) {
            request.headers.authorization = `bearer ${request.headers.apikey}`;
        }
    });

    register(fastifyRequestContext, {
        hook: "preValidation",
        defaultStoreValues: {},
    });

    app.addHook("preValidation", async (request, response) => {
        request.requestContext.set(
            "origin",
            `${request.protocol}://${request.hostname}`
        );

        response.header("X-Powered-By", packageIdentifier);

        // Some details about time since commit
        response.header("X-Source-Commit", commitShort);
        response.header("X-Source-Commit-At", commitAt);
    });

    register(authPlugin);
    register(bearerAuthPlugin, {
        keys: new Set<string>(),
        auth: bearerAuthentication,
        addHook: false,
    });
    app.setErrorHandler(errorHandler);

    register(blippPlugin);
    register(corsPlugin);

    await setupSwagger(app);

    const { routes: providedRoutes } = getConfig();

    if (providedRoutes) {
        await register(providedRoutes);
    }

    register(routes);

    return app;
}

export async function create(config?: Partial<Config>): ReturnType<typeof createFastifyApplication> {
    if (config) {
        return withConfig(getConfig(config), () => create());
    }

    return createFastifyApplication();
}

export async function start(config?: Partial<Config>): Promise<() => Promise<void>> {
    if (config) {
        return withConfig(getConfig(config), () => start());
    }

    const app = await create(config);

    // Before we start, we should seed
    await autoSeed();

    const port = getPort();

    await app.listen({ port, host: "127.0.0.1" });

    app.blipp();

    return async () => {
        await app.close();
        // close any opened connections
        await stopData();
    };
}
