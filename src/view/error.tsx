import { FastifyReply, FastifyRequest } from "fastify";
import { renderToStaticMarkup } from "react-dom/server";
import HappeningServer from "../react/server";
import { getOrigin } from "../listen/config";
import { getMaybeUser, getUser, isAnonymous } from "../authentication";
import { isHTMLResponse } from "../listen/authentication";

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  response: FastifyReply
) {
  if (!isHTMLResponse(request)) {
    return response.send(error);
  }

  const { pathname } = new URL(request.url, getOrigin());
  const isFragment = pathname.endsWith("/fragment");
  const anonymous = isAnonymous();
  const user = getMaybeUser();
  const { DEFAULT_TIMEZONE = "Pacific/Auckland" } = process.env;

  const html = renderToStaticMarkup(
    <HappeningServer
      isFragment={isFragment}
      isAnonymous={anonymous}
      url="/error"
      error={error}
      organisations={[]}
      partners={[]}
      user={user}
      timezone={DEFAULT_TIMEZONE}
    />
  );

  response.header("Cache-Control", "No-Store");
  response.header("Content-Type", "text/html; charset=utf-8");
  response.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.send(html);
}
