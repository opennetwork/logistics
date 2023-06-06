import {isLike, ok} from "../is";
import {
    AuthenticationState,
    getAccessToken as getAccessTokenDocument,
    getAuthenticationState,
    getPartner as getPartnerDocument,
    getUser,
    User,
} from "../data";
import {
    DoneFuncWithErrOrRes,
    FastifyInstance,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { FastifyAuthFunction } from "@fastify/auth";
import {
    AUTHORIZED_ACCESS_TOKEN_KEY,
    AUTHORIZED_PARTNER,
    setAuthenticationState,
    setAuthorizedForPartnerId,
    setUser,
} from "../authentication";
import { preHandlerHookHandler } from "fastify/types/hooks";
import accepts from "accepts";
import { getOrigin } from "./config";
import { logoutResponse } from "./auth/logout";
import "@fastify/cookie";

export const NOT_AUTHORIZED_ERROR_MESSAGE = "not authorized";
export const NOT_ANONYMOUS_ERROR_MESSAGE = "not anonymous";

export async function bearerAuthentication(
    key: string,
    request: FastifyRequest
): Promise<boolean> {
    if (!key) return false;
    const token = await getAccessTokenDocument(key);
    if (!token) return false;
    if (token.disabledAt) return false;

    if (token.partnerId) {
        setAuthorizedForPartnerId(token.partnerId);
        const partner = await getPartnerDocument(token.partnerId);
        ok(partner, "Expected partner to be available");
        request.requestContext.set(AUTHORIZED_PARTNER, partner);
        if (process.env.VOUCH_REQUIRE_PARTNER_APPROVAL) {
            if (!partner.approved) return false;
        }
    }

    request.requestContext.set("accessTokenAuthentication", true);
    request.requestContext.set("accessToken", token);
    request.requestContext.set(AUTHORIZED_ACCESS_TOKEN_KEY, token.accessToken);

    return true;
}

function getCookieState(request: FastifyRequest) {
    return request.cookies.state;
}

function getAccessToken(request: FastifyRequest) {
    ok<{ accessToken?: string }>(request.query);
    return request.query.accessToken;
}

function getAuthorizationHeader(request: FastifyRequest) {
    return request.headers.authorization;
}

export const allowAnonymous: FastifyAuthFunction = (
    request,
    response,
    done
) => {
    const value = !!(
        getCookieState(request) ||
        getAuthorizationHeader(request) ||
        getAccessToken(request)
    );
    if (value) {
        return done(Error(NOT_ANONYMOUS_ERROR_MESSAGE));
    }
    return done();
};

export const accessToken: FastifyAuthFunction = async (request) => {
    const accessToken = getAccessToken(request);
    if (!accessToken) {
        throw new Error(NOT_AUTHORIZED_ERROR_MESSAGE);
    }
    const success = await bearerAuthentication(accessToken, request);
    if (!success) {
        throw new Error(NOT_AUTHORIZED_ERROR_MESSAGE);
    }
};

function createCookieAuth(fastify: FastifyInstance): FastifyAuthFunction {
    return async (request) => {
        const signedStateId = getCookieState(request);
        ok(typeof signedStateId === "string", NOT_AUTHORIZED_ERROR_MESSAGE);
        const unsignedCookie = fastify.unsignCookie(signedStateId);
        ok(unsignedCookie.valid, NOT_AUTHORIZED_ERROR_MESSAGE);
        const state = await getAuthenticationState(unsignedCookie.value);
        ok(state, NOT_AUTHORIZED_ERROR_MESSAGE);
        ok(state.type === "cookie", NOT_AUTHORIZED_ERROR_MESSAGE);
        setAuthenticationState(state);
        if (state.userId) {
            const user: User | undefined = await getUser(state.userId);
            ok(user, NOT_AUTHORIZED_ERROR_MESSAGE);
            setUser(user);
        }
    };
}

export function getFastifyVerifyBearerAuth(
    fastify: FastifyInstance
): FastifyAuthFunction {
    const verifyBearerAuth = fastify.verifyBearerAuth;
    ok(
        verifyBearerAuth,
        "Expected verifyBearerAuth, please setup @fastify/bearer-auth"
    );
    return verifyBearerAuth;
}

export interface FastifyAuthOptions {
    relation?: "and" | "or";
    run?: "all";
}

export function getFastifyAuth(fastify: FastifyInstance) {
    const auth = fastify.auth;
    ok(auth, "Expected auth, please setup @fastify/auth");
    return auth;
}

export interface AuthInput extends FastifyAuthOptions {
    anonymous?: boolean;
}

export function isHTMLResponse(request: FastifyRequest) {
    const acceptValue = request.headers.accept;
    if (!acceptValue) return false;
    // json is the default for server, but if the client prefers html
    // that is what we are looking for
    const accept = accepts(request.raw).type(["json", "html"]);
    return accept === "html";
}

export function authenticate(
    fastify: FastifyInstance,
    options?: AuthInput
): preHandlerHookHandler {
    const methods: FastifyAuthFunction[] = [
        createCookieAuth(fastify),
        accessToken,
        getFastifyVerifyBearerAuth(fastify),
    ];

    if (options?.anonymous) {
        methods.unshift(allowAnonymous);
    }

    const authHandler = getFastifyAuth(fastify)(methods, options);

    return function (this, request, response, done) {
        // const { pathname, searchParams } = new URL(request.url, getOrigin());
        // if (pathname === "/" && searchParams.get("auth") === "redirected") {
        //   return done();
        // }

        if (!isHTMLResponse(request)) {
            return authHandler.call(this, request, response, done);
        }

        return authHandler.call(this, request, response, function (error: unknown) {
            // console.log({
            //   error,
            //   statusCode: response.statusCode,
            //   args,
            // });
            if (!error && response.statusCode === 200) {
                return done();
            }

            logoutResponse(response).finally(() => {
                response.header("Location", "/?auth=redirected");
                response.status(302);
                response.send("Unauthenticated, redirecting...");
            });
        });
    };
}

export function setCookies(response: FastifyReply, { stateId, expiresAt }: AuthenticationState) {

    response.setCookie("state", stateId, {
        path: "/",
        signed: true,
        expires: new Date(expiresAt),
    });
}
//
// export function isCookieReply(response: FastifyReply): response is FastifyReply & CoookieFastifyRequest {
//     return !!(
//         isLike<Partial<CoookieFastifyReply>>(response) &&
//         response.setCookie
//     )
// }
//
//
//
// interface CookieFastifyInstance extends SignerMethods {
//     /**
//      * Manual cookie parsing method
//      * @docs https://github.com/fastify/fastify-cookie#manual-cookie-parsing
//      * @param cookieHeader Raw cookie header value
//      */
//     parseCookie(cookieHeader: string): {
//         [key: string]: string;
//     };
// }
//
// interface CoookieFastifyRequest extends SignerMethods {
//     /**
//      * Request cookies
//      */
//     cookies: { [cookieName: string]: string | undefined };
// }
//
// interface SignerMethods {
//     /**
//      * Signs the specified cookie using the secret/signer provided.
//      * @param value cookie value
//      */
//     signCookie(value: string): string;
//
//     /**
//      * Unsigns the specified cookie using the secret/signer provided.
//      * @param value Cookie value
//      */
//     unsignCookie(value: string): UnsignResult;
// }
//
// export type setCookieWrapper = (
//     name: string,
//     value: string,
//     options?: CookieSerializeOptions
// ) => FastifyReply;
//
// interface CoookieFastifyReply extends SignerMethods {
//     /**
//      * Request cookies
//      */
//     cookies: { [cookieName: string]: string | undefined };
//
//     /**
//      * Set response cookie
//      * @name setCookie
//      * @param name Cookie name
//      * @param value Cookie value
//      * @param options Serialize options
//      */
//     setCookie(
//         name: string,
//         value: string,
//         options?: CookieSerializeOptions
//     ): this;
//
//     /**
//      * @alias setCookie
//      */
//     cookie(
//         name: string,
//         value: string,
//         options?: CookieSerializeOptions
//     ): this;
//
//     /**
//      * clear response cookie
//      * @param name Cookie name
//      * @param options Serialize options
//      */
//     clearCookie(
//         name: string,
//         options?: CookieSerializeOptions
//     ): this;
//
//     /**
//      * Unsigns the specified cookie using the secret provided.
//      * @param value Cookie value
//      */
//     unsignCookie(value: string): UnsignResult;
// }