import {FastifyInstance} from "fastify";
import {logoutResponse} from "./logout";
import {addCookieState, addUser, getExternalUser} from "../../data";
import {v4} from "uuid";

export async function anonymousRoutes(fastify: FastifyInstance) {

    const {
        ALLOW_ANONYMOUS_USER
    } = process.env;

    if (!ALLOW_ANONYMOUS_USER) return;

    type Querystring = {
        redirect?: string;
    }
    type Schema = {
        Querystring: Querystring
    };

    fastify.get<Schema>("/anonymous", {
        async handler(request, response) {
            await logoutResponse(response);

            const user = await addUser({
                externalType: "anonymous",
            });
            await getExternalUser(user.externalType, user.userId, user);

            const state = await addCookieState({
                userId: user.userId,
                roles: [
                    "anonymous"
                ],
                from: {
                    type: "anonymous",
                    createdAt: new Date().toISOString()
                }
            });

            const { stateId, expiresAt } = state;

            response.setCookie("state", stateId, {
                path: "/",
                signed: true,
                expires: new Date(expiresAt),
            });

            const { redirect } = request.query;
            if (redirect) {
                response.header("Location", redirect);
                response.status(302);
                response.send();
                return;
            }

            response.status(201);
            response.send();

        }
    })
}