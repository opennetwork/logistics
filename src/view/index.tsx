import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  commit,
  commitAt,
  commitAuthor,
  packageIdentifier,
  secondsBetweenCommitAndBuild,
  secondsBetweenCommitAndTestCompletion,
  timeBetweenCommitAndBuild,
  timeBetweenCommitAndTestCompletion,
} from "../package";
import {
  paths,
  pathsAnonymous,
  pathsCache,
  pathsHandler,
  pathsSubmit,
} from "../react/server/paths";
import HappeningServer, { HappeningServerProps } from "../react/server";
import { renderToStaticMarkup } from "react-dom/server";
import {
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
  getUser,
  isAnonymous,
} from "../authentication";
import { ok } from "../is";
import { join, dirname } from "node:path";
import { addCachedPage, getCached, getCachedPage } from "../data/cache";
import { getOrigin } from "../listen/config";
import {PartialView, View} from "./types";
import {getConfig} from "../config";

const { pathname } = new URL(import.meta.url);
const DIRECTORY = dirname(pathname);
export const REACT_CLIENT_DIRECTORY = join(DIRECTORY, "../react/client");

export async function viewRoutes(fastify: FastifyInstance) {
  const { ALLOW_ANONYMOUS_VIEWS, ENABLE_CACHE, DEFAULT_TIMEZONE = "Pacific/Auckland" } = process.env;

  fastify.get("/server.css", async (request, response) => {
    response.header("Content-Type", "text/css");
    response.send(ServerCSS);
  });

  function createPathHandler(
    view: PartialView,
    options?: Partial<HappeningServerProps>,
    isPathCached?: boolean
  ) {
    const baseHandler = view.handler;
    const submitHandler = view.submit;

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let baseResult: unknown = undefined;
      if (baseHandler) {
        baseResult = await baseHandler(request, response);
        if (response.sent) return;
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
          !submitHandler &&
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
        const anonymous = isAnonymous();
        const state = getMaybeAuthenticationState();
        const { pathname } = new URL(request.url, getOrigin());
        const isFragment = pathname.endsWith("/fragment");
        const user = getMaybeUser();

        // console.log({ anonymous, state, roles: state?.roles });

        // Can go right to static, should be no async loading within components
        let html = renderToStaticMarkup(
          <HappeningServer
            {...options}
            input={baseResult}
            url={view.path}
            isAnonymous={anonymous}
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
  function createPathSubmitHandler(view: PartialView) {
    const { submit, path } = view;
    ok(
      typeof submit === "function",
      `Expected pathSubmit.${path} to be a function`
    );

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let result, error;
      try {
        result = await submit(request, response);
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
        false
      );
      await pathHandler(request, response);
    };
  }

  function createView(view: PartialView) {
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
  }

  const { views = [] } = getConfig();

  const includedPaths = views.map(view => view.path);

  views
      .forEach(createView);

  Object.keys(paths)
      .filter(path => !includedPaths.includes(path))
      .forEach((path) => {
        createView({
          path,
          anonymous: pathsAnonymous[path] || !!ALLOW_ANONYMOUS_VIEWS,
          cached: pathsCache[path] || false,
          handler: pathsHandler[path],
          submit: pathsSubmit[path]
        })
      });
}
