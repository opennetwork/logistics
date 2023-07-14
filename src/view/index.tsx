import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import OpenNetworkServer, {OpenNetworkServerProps, ReactData} from "../react/server";
import { renderToStaticMarkup } from "react-dom/server";
import {
  listOffers,
  listOrganisations,
  listPartners, listProducts,
} from "../data";
import { authenticate } from "../listen/authentication";
import ServerCSS from "../react/server/server-css";
import {
  getMaybeAuthenticationState,
  getMaybeAuthorizedForOrganisationId,
  getMaybeAuthorizedForPartnerId,
  getMaybeUser,
  isUnauthenticated,
} from "../authentication";
import {isLike, ok} from "../is";
import { join, dirname } from "node:path";
import { addCachedPage, getCachedPage } from "../data";
import { getOrigin } from "../listen/config";
import {View} from "./types";
import {getConfig} from "../config";
import {getViews} from "./views";
import {importmapPrefix, importmapRoot, importmapRootName, name, root} from "../package";
import etag from "@fastify/etag";
import files from "@fastify/static";

export * from "./error";
export * from "./types";

const { pathname } = new URL(import.meta.url);
const DIRECTORY = dirname(pathname);
export const REACT_CLIENT_DIRECTORY = join(DIRECTORY, "../react/client");

export async function fileRoutes(fastify: FastifyInstance) {
  await fastify.register(etag);
  await fastify.addHook("onRequest", (request, response, done) => {
    response.header("Cache-Control", "max-age=1800"); // Give it something
    done();
  });
  await fastify.register(files, {
    root: REACT_CLIENT_DIRECTORY,
    decorateReply: !fastify.hasReplyDecorator("sendFile"),
    prefix: `/${name}/client`,
  });
  const publicPath = join(root, "./public");
  await fastify.register(files, {
    root: publicPath,
    decorateReply: false,
    prefix: `/${name}/public`,
  });
  await fastify.register(files, {
    // Relative to top level of this module
    // NOT relative to cwd
    root: importmapRoot,
    prefix: `${importmapPrefix ? `/${importmapPrefix}/` : ""}${importmapRootName}`,
    decorateReply: false,
  });
}

export async function styleRoutes(fastify: FastifyInstance) {
  fastify.get(`/${name}/server.css`, async (request, response) => {
    response.header("Content-Type", "text/css");
    response.send(ServerCSS);
  });
}

export async function viewRoutes(fastify: FastifyInstance) {
  const { ALLOW_ANONYMOUS_VIEWS, ENABLE_CACHE, DEFAULT_TIMEZONE = "Pacific/Auckland" } = process.env;

  fastify.register(fileRoutes);
  fastify.register(styleRoutes);

  function createPathHandler(
    view: View,
    options?: Partial<OpenNetworkServerProps>,
    isPathCached?: boolean,
    baseResultGiven?: { value: unknown }
  ) {
    const baseHandler = view.handler;
    const submitHandler = view.submit;

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let baseResult: unknown = undefined;
      if (baseResultGiven) {
        baseResult = baseResultGiven.value;
      } else {
        if (!isPathCached && baseHandler) {
          baseResult = await baseHandler(request, response);
          if (response.sent) return;
        }
      }

      const html = await getHTML();

      if (response.sent) return;

      // All pages are dynamically rendered for each role
      // We require all pages to be re-fetched from our server
      // We will cache anything we need server side
      response.header("Cache-Control", "No-Store");
      response.header("Content-Type", "text/html; charset=utf-8");
      response.header("Cross-Origin-Embedder-Policy", "unsafe-none");

      if (!response.statusCode) {
        response.status(200);
      }
      response.send(html);

      async function getHTML() {
        const isCacheUsable = !!(
          isPathCached &&
          ENABLE_CACHE &&
          request.method.toLowerCase() === "get"
        );
        if (isCacheUsable) {
          const cached = await getCachedPage(request.url);
          if (cached) {
            response.header("X-Back-Cache-Hit", "1");
            return cached;
          }
        }
        response.header("X-Back-Cache-Miss", `1, ${isCacheUsable ? 1 : 0}`);
        const html = await getRenderedHTML();
        if (isCacheUsable) {
          response.header("X-Back-Cache-Set", "1");
          await addCachedPage(request.url, html);
        }
        return html;
      }

      async function getRenderedHTML() {

        if (isPathCached && baseHandler && !baseResultGiven) {
          baseResult = await baseHandler(request, response);
        }

        const anonymous = isUnauthenticated();
        const state = getMaybeAuthenticationState();
        const { pathname } = new URL(request.url, getOrigin());
        const isFragment = pathname.endsWith("/fragment");
        const user = getMaybeUser();
        const origin = getOrigin();

        // console.log({ anonymous, state, roles: state?.roles });

        // Can go right to static, should be no async loading within components
        let html = renderToStaticMarkup(
          <OpenNetworkServer
            {...(isLike<Partial<ReactData>>(baseResult) ? baseResult : {})}
            {...options}
            view={view}
            config={getConfig()}
            input={baseResult}
            url={new URL(request.url, origin).toString()}
            origin={origin}
            isUnauthenticated={anonymous}
            isFragment={isFragment}
            partners={await listPartners({
              authorizedPartnerId: getMaybeAuthorizedForPartnerId(),
            })}
            organisations={await listOrganisations({
              authorizedOrganisationId: getMaybeAuthorizedForOrganisationId(),
            })}
            products={await listProducts({
              // Making it obvious that if you are anonymous
              // only public products will be visible
              public: anonymous
            })}
            authenticationState={getMaybeAuthenticationState()}
            roles={state?.roles}
            query={request.query}
            body={request.body}
            user={user}
            timezone={DEFAULT_TIMEZONE}
          />
        );

        if (!isFragment) {
          html = `<!doctype html>\n${html}`;
        }

        return html;
      }
    };
  }
  function createPathSubmitHandler(view: View) {
    const { submit, handler: baseHandler, path, deferHandlerWhenSubmit } = view;
    ok(
      typeof submit === "function",
      `Expected pathSubmit.${path} to be a function`
    );

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let baseResultGiven;

      if (baseHandler && deferHandlerWhenSubmit !== false) {
        baseResultGiven = {
          value: await baseHandler(request, response)
        };
        if (response.sent) return;
      }

      let result, error;
      try {
        result = await submit(request, response, baseResultGiven?.value);
        if (response.sent) return;
      } catch (caught) {
        error = caught;
      }
      const pathHandler = createPathHandler(
        view,
        {
          result,
          error,
          submitted: true,
        },
        false,
          baseResultGiven
      );
      await pathHandler(request, response);
    };
  }

  function createView(view: View) {
    const {
      path,
      anonymous,
      cached: isPathCached = false,
      submit
    } = view;
    const pathHandler = createPathHandler(view, {}, isPathCached);
    const preHandler = authenticate(fastify, {
      anonymous: anonymous || !!ALLOW_ANONYMOUS_VIEWS,
    });
    const fragmentSuffix = `${path === "/" ? "" : "/"}fragment`;

    try {
      fastify.get(`${path}${fragmentSuffix}`, {
        preHandler,
        handler: pathHandler,
      });
      fastify.get(path, {
        preHandler,
        handler: pathHandler,
      });

      if (submit) {
        const submitHandler = createPathSubmitHandler(view);
        fastify.post(path, {
          preHandler,
          handler: submitHandler,
        });
        fastify.post(`${path}${fragmentSuffix}`, {
          preHandler,
          handler: submitHandler,
        });
      }
    } catch {}
  }

  const allViews = getViews();
  allViews.forEach(createView);
}
