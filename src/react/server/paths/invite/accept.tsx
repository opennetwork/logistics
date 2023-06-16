import {useData, useError, useInput, useMaybeBody, useMaybeResult, useSubmitted, useTimezone} from "../../data";
import {HappeningFormMetaData} from "../create-happening";
import {
    isAnonymous,
    getUser,
    getMaybeAuthenticationState,
    setAuthenticationState as setAuthenticatedAuthenticationState
} from "../../../../authentication";
import {FastifyReply, FastifyRequest} from "fastify";
import {
    addAuthenticationState,
    AuthenticationState, DEFAULT_INVITEE_EXCHANGE_STATE_EXPIRES_MS,
    deleteAuthenticationState,
    getAuthenticationState,
    getExpiresAt,
    getInviteeState,
    getUserAuthenticationRoleForUser,
    InviteeState,
    isInviteeState,
    MINUTE_MS,
    setAuthenticationState,
    setUserAuthenticationRole,
    UserAuthenticationRole,
} from "../../../../data";
import {ok} from "../../../../is";
import {path as DEFAULT_LOGIN_URL} from "../login";
import {getOrigin} from "../../../../listen/config";

const {
    LOGIN_URL
} = process.env

export const path = "/invite/accept";
export const anonymous = true;

interface Body {
    stateKey: string;
    token: string;
}

type Schema = {
    Body: Body
}

type InputSchema = {
    Querystring?: Partial<Body> & { state?: string }
    Body?: Body
}

const INVALID_INVITE = "Invalid or expired invite";

interface Input {
    stateId: string;
    state: InviteeState;
    states: AuthenticationState[]
}

export async function handler(request: FastifyRequest<InputSchema>): Promise<Input> {
    const stateId = request.body?.stateKey || request.query.stateKey || request.query.state;
    const token = request.body?.token || request.query.token;

    ok(stateId, INVALID_INVITE);

    console.log({
        stateId,
        token
    });

    let state: InviteeState;

    const states = [];

    if (!token) {
        const exchangeState = await getAuthenticationState(stateId);
        states.push(exchangeState);
        ok(exchangeState, INVALID_INVITE);
        ok(exchangeState.type === "exchange", INVALID_INVITE);
        ok(exchangeState.userState, INVALID_INVITE);
        const foundState = await getAuthenticationState(exchangeState.userState);
        ok(isInviteeState(foundState), INVALID_INVITE);
        state = foundState;
        states.push(state);
    } else {
        state = await getInviteeState({
            stateId,
            token
        })
        states.push(state);
    }

    console.log({ state });

    ok(state, INVALID_INVITE);

    return {
        state,
        states,
        stateId
    };
}

export async function submit(request: FastifyRequest<InputSchema>, response: FastifyReply, input: Input) {
    const {
        stateId,
        state,
        states
    } = input;

    if (isAnonymous()) {
        let expiresAt = getExpiresAt(DEFAULT_INVITEE_EXCHANGE_STATE_EXPIRES_MS);
        // Ensure it can't be used longer than the base invite
        if (new Date(expiresAt).getTime() > new Date(state.expiresAt).getTime()) {
            expiresAt = state.expiresAt;
        }

        const url = new URL(LOGIN_URL || DEFAULT_LOGIN_URL, getOrigin());

        // The exchange state is not the same as the base invitee state with a token
        // A base invitee state MUST have a token, which this does not
        // So they cannot be interchanged, the types are also different...
        const exchangeState = await addAuthenticationState({
            type: "exchange",
            exchange: true,
            // Reference the original stateKey
            userState: stateId,
            // Shorter lived
            expiresAt,
            redirectUrl: url.toString(),
        });

        url.searchParams.set("state", exchangeState.stateId);

        response.status(302);
        response.header("Location", url.toString());
        response.send("Redirecting...");
        return;
    }

    const user = getUser();
    const existingRole = await getUserAuthenticationRoleForUser(user);

    const role = await setUserAuthenticationRole({
        ...existingRole,
        userId: user.userId,
        expiresAt: user.expiresAt,
        roles: [...new Set([
            ...(existingRole?.roles || []),
            ...(state.roles || [])
        ])]
    });
    console.log("created role", {
        existingRole,
        role
    });

    console.log("deleting states", states);
    for (const state of states) {
        await deleteAuthenticationState(state.stateId);
    }

    const maybe = getMaybeAuthenticationState();

    if (maybe?.stateId) {
        const updatedState = await setAuthenticationState({
            ...maybe,
            roles: [...new Set([
                ...maybe.roles,
                ...role.roles
            ])]
        });
        setAuthenticatedAuthenticationState(updatedState);
    }

    return role;
}

export function AcceptInvite() {

    const input = useInput<Input>();
    const body = useMaybeBody<Body>();
    const error = useError();
    const { url, isAnonymous } = useData();
    const { searchParams } = new URL(url);
    const result = useMaybeResult<UserAuthenticationRole>();

    console.error(error);

    return <Body body={body} />

    function Body({ body }: { body?: Body }) {
        return (
            <form name="accept-invite" action={`${path}#action-section`} method="post">
                <input name="stateKey" value={body?.stateKey ?? searchParams.get("state") ?? searchParams.get("stateKey")} type="hidden" />
                <input name="token" value={body?.token ?? searchParams.get("token")} type="hidden" />
                <div id="action-section">
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
                    >
                        {isAnonymous ? "Login & " : ""}Accept Invite
                    </button>
                </div>
                {error ? (
                    <>
                        <hr className="my-8" />
                        <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-red-400 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                            <p className="text-sm leading-6 text-white">
                                {error instanceof Error ? error.message : String(error)}
                            </p>
                        </div>
                        <hr className="my-8" />
                    </>
                ) : undefined}
                {
                    result ? (
                        <div>
                            <br />
                            <br />
                            <p>
                                Assigned role{result.roles.length > 1 ? "s" : ""}: {result.roles.map(value => `"${value}"`).join(", ")}
                            </p>
                        </div>
                    ) : undefined
                }
            </form>
        )
    }

}

export const Component = AcceptInvite;