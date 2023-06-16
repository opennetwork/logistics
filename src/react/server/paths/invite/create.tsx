import {FastifyRequest} from "fastify";
import {
    addInviteeState,
    AuthenticationRole,
    InviteeState,
} from "../../../../data";
import {ok} from "../../../../is";
import {isRole, getAuthenticationRoles} from "../../../../authentication"
import {useError, useMaybeBody, useMaybeResult} from "../../data";

export const path = "/invite/create";

type Body = {
    role: AuthenticationRole;
}

type Schema = {
    Body: Body
}

const FORM_CLASS = `
mt-1
block
w-full
md:max-w-sm
rounded-md
border-gray-300
shadow-sm
focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
disabled:bg-slate-300 disabled:cursor-not-allowed
`.trim();
const FORM_GROUP_CLASS = `block py-2`;

interface Result extends Pick<InviteeState, "inviteUrl">, Body {
}

export async function submit(request: FastifyRequest<Schema>): Promise<Result> {
    const { role } = request.body;
    console.log(role, getAuthenticationRoles());
    ok(isRole(role), "Must be the role to invite as role");
    const { inviteUrl } = await addInviteeState({
        roles: [role]
    });
    return { inviteUrl, role };
}

export function CreateInvite() {
    const body = useMaybeBody<Body>();
    const result = useMaybeResult<Result>();
    const error = useError();

    console.error(error);

    return <Body body={result ? undefined : body} />

    function Body({ body }: { body?: Body }) {
        return (
            <form name="create-invite" action={`${path}#action-section`} method="post">
                <div className="flex flex-col">
                    <label className={FORM_GROUP_CLASS}>
                        <span className="text-gray-700">What role would you like to invite?</span>
                        <select name="role" className={FORM_CLASS} defaultValue={body?.role ?? getAuthenticationRoles()[0]}>
                            {getAuthenticationRoles().map(
                                (role, index) => <option key={index} value={role}>{role}</option>
                            )}
                        </select>
                    </label>
                </div>
                <div id="action-section">
                    <button
                        type="submit"
                        className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
                    >
                        Create Invite
                    </button>
                </div>
                {
                    result ? (
                        <div>
                            <br />
                            <br />
                            <p>
                                Created invite url for the role "{result.role}":
                            </p>
                            <br />
                            <pre>
                                {result.inviteUrl}
                            </pre>
                        </div>
                    ) : undefined
                }
            </form>
        )
    }
}

export const Component = CreateInvite;