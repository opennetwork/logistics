import {FastifyInstance, FastifyReply} from "fastify";
import {authenticate} from "../authentication";
import {
    generateAuthenticationOptions,
    GenerateAuthenticationOptionsOpts,
    generateRegistrationOptions, verifyAuthenticationResponse,
    verifyRegistrationResponse
} from "@simplewebauthn/server";
import {name} from "../../package";
import {listUserCredentials, setUserCredential, UserCredential} from "../../data/user-credential";
import {getMaybeUser} from "../../authentication";
import {createHash} from "crypto";
import {
    AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialDescriptorFuture, PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON
} from "@simplewebauthn/typescript-types";
import {GenerateRegistrationOptionsOpts} from "@simplewebauthn/server/dist/registration/generateRegistrationOptions";
import {
    addCookieState,
    addExternalUser, AuthenticationRole,
    AuthenticationState, AuthenticationStateData,
    deleteAuthenticationState,
    getAuthenticationState, getExternalReference, getExternalUser,
    getUser, getUserAuthenticationRoleForUser,
    setAuthenticationState, setExternalReference, UntypedAuthenticationStateData
} from "../../data";
import {ok} from "../../is";
import base64 from "@hexagon/base64";
import fromArrayBuffer = base64.fromArrayBuffer;
import toArrayBuffer = base64.toArrayBuffer;
import {getOrigin} from "../config";

const INVALID_MESSAGE = "Authentication state invalid or expired";

export interface WebAuthnAuthenticationOptionsBody extends Pick<UserCredential, "authenticatorType"> {
    email?: string
    redirectUrl?: string;
    registration?: Partial<GenerateRegistrationOptionsOpts>
    authentication?: Partial<GenerateAuthenticationOptionsOpts>
}

export interface WebAuthnAuthenticationResponse {
    authentication: {
        options: PublicKeyCredentialRequestOptionsJSON;
        state: string;
    };
    registration: {
        options: PublicKeyCredentialCreationOptionsJSON;
        state: string;
    };
}

export interface VerifyWebAuthnAuthenticationOptionsBody {
    registration?: RegistrationResponseJSON;
    authentication?: AuthenticationResponseJSON;
    state: string;
}

export interface VerifyWebAuthnAuthenticationResponse {
    verified: boolean;
    redirectUrl?: string;
}

export async function webauthnRoutes(fastify: FastifyInstance) {
    const {
        WEBAUTHN_RP_NAME = name,
        WEBAUTHN_RP_ID,
        WEBAUTHN_RP_ORIGIN,
        WEBAUTHN_REDIRECT_URL = "/"
    } = process.env;

    {
        const body = {
            type: "object",
            properties: {
                email: {
                    type: "string",
                    nullable: true
                },
                authenticatorType: {
                    type: "string",
                    nullable: true
                },
                redirectUrl: {
                    type: "string",
                    nullable: true
                }
            },
            additionalProperties: true
        }
        type Schema = {
            Body: WebAuthnAuthenticationOptionsBody
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.post<Schema>("/webauthn/generate-options", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                response.send(
                    getWebAuthnAuthenticationOptions(request.body)
                );
            }
        })
    }

    {
        const body = {
            type: "object",
            properties: {
                registration: {
                    type: "object",
                    properties: {},
                    additionalProperties: true,
                    nullable: true
                },
                authentication: {
                    type: "object",
                    properties: {},
                    additionalProperties: true,
                    nullable: true
                },
                state: {
                    type: "string"
                }
            },
            additionalProperties: true,
            required: ["state"]
        };
        type Schema = {
            Body: VerifyWebAuthnAuthenticationOptionsBody
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.post<Schema>("/webauthn/verify", {
            schema,
            preHandler: authenticate(fastify, {anonymous: true}),
            async handler(request, response) {
                try {
                    response.send(
                        await verifyWebAuthnAuthentication(request.body, response)
                    );
                } catch (error) {
                    console.error(error);
                    response.status(400);
                    response.send({ error: error.message })
                    return;
                }
            }
        });
    }
}

export async function getWebAuthnAuthenticationOptions(body: WebAuthnAuthenticationOptionsBody): Promise<WebAuthnAuthenticationResponse> {
    const {
        WEBAUTHN_RP_NAME = name,
        WEBAUTHN_RP_ID
    } = process.env;

    const { email, authenticatorType, registration, authentication, redirectUrl } = body;
    const externalId = createUserId();
    const reference = await getExternalReference("credential", externalId);
    const existingUser = getMaybeUser();

    if (reference && existingUser && reference.userId !== existingUser.userId) {
        throw new Error("Expected user to be logged in");
    }

    const userId: string | undefined = existingUser?.userId || reference?.userId;
    const credentials = userId ? await listUserCredentials(userId) : []

    const registrationPromise = createRegistration();
    const authenticationPromise = createAuthentication();

    return {
        registration: await registrationPromise,
        authentication: await authenticationPromise,
    };

    async function createAuthentication() {

        const matchingType = credentials.filter(
            credential => credential.authenticatorType === authenticatorType
        );

        const allowCredentials = matchingType.map((credential): PublicKeyCredentialDescriptorFuture => ({
            id: toArrayBuffer(credential.credentialId),
            type: "public-key",
            transports: credential.authenticatorTransports
        }));

        const options = generateAuthenticationOptions({
            userVerification: "preferred",
            ...authentication,
            allowCredentials: allowCredentials.length ? allowCredentials : undefined,
        });

        const { stateKey: state } = await setAuthenticationState({
            type: "challenge",
            challenge: options.challenge,
            externalId,
            authenticatorType,
            redirectUrl
        });

        return {
            options,
            state
        }
    }

    async function createRegistration() {
        if (reference && !existingUser) {
            return undefined;
        }
        const excludeCredentials = credentials.flatMap((credential) => {
            return credential.credentialId.split("_")
                .map((credentialId): PublicKeyCredentialDescriptorFuture => ({
                    id: Buffer.from(credentialId, "base64"),
                    type: "public-key",
                    transports: undefined
                }))
        });

        const { hostname } = new URL(getOrigin());

        const options = generateRegistrationOptions({
            // Don't prompt users for additional information about the authenticator
            // (Recommended for smoother UX)
            attestationType: "none",
            // Prevent users from re-registering existing authenticators
            excludeCredentials,
            ...registration,
            rpName: WEBAUTHN_RP_NAME || hostname,
            rpID: WEBAUTHN_RP_ID || hostname,
            userID: userId,
            userName: email,
        });

        const { stateKey: state } = await setAuthenticationState({
            type: "challenge",
            challenge: options.challenge,
            externalId,
            authenticatorType,
            redirectUrl
        });

        return {
            options,
            state
        }
    }

    function createUserId() {
        const { hostname } = new URL(getOrigin());
        console.log({ hostname });
        const hash = createHash("sha256");
        hash.update(WEBAUTHN_RP_ID || hostname);
        hash.update(email);
        return hash.digest().toString("hex");
    }
}

export async function verifyWebAuthnAuthentication(body: VerifyWebAuthnAuthenticationOptionsBody, response?: FastifyReply): Promise<VerifyWebAuthnAuthenticationResponse> {
    const {
        WEBAUTHN_RP_ID,
        WEBAUTHN_RP_ORIGIN,
        WEBAUTHN_REDIRECT_URL = "/"
    } = process.env;
    const state = await getAuthenticationState(body.state);
    assertChallenge(state);
    await deleteAuthenticationState(state.stateId);

    const reference = await getExternalReference("credential", state.externalId);
    const existingUser = getMaybeUser();

    const { registration, authentication } = body;

    if (registration && reference && !existingUser) {
        throw new Error("Login required before linking user");
    }
    if (reference && existingUser && reference.userId !== existingUser.userId) {
        throw new Error("Expected user to be logged in");
    }

    const expectedChallenge = state.challenge;
    const redirectUrl = state.redirectUrl || WEBAUTHN_REDIRECT_URL || "/";

    if (registration) {
        ok<RegistrationResponseJSON>(body);
        const { hostname, origin } = new URL(getOrigin());

        const { verified, registrationInfo } = await verifyRegistrationResponse({
            response: registration,
            expectedChallenge,
            expectedOrigin: WEBAUTHN_RP_ORIGIN || origin,
            expectedRPID: WEBAUTHN_RP_ID || hostname
        });

        const existingUser = getMaybeUser();
        const user = await addExternalUser({
            externalType: "credential",
            externalId: state.externalId
        }, existingUser);

        if (verified) {

            const { credentialPublicKey, credentialID, counter } = registrationInfo;
            const userCredential = await setUserCredential({
                userId: user.userId,
                credentialId: fromArrayBuffer(credentialID, true),
                credentialPublicKey: fromArrayBuffer(credentialPublicKey, true),
                credentialCounter: counter,
                authenticatorType: state.authenticatorType,
                verifiedAt: new Date().toISOString()
            });

            if (!existingUser && response) {
                const userRoles = await getUserAuthenticationRoleForUser(user);
                const data: UntypedAuthenticationStateData & Record<string, unknown> = {
                    userId: user.userId,
                    roles: [...new Set<AuthenticationRole>([
                        "member",
                        ...(userRoles?.roles ?? [])
                    ])],
                    from: {
                        type: "credential",
                        createdAt: state.createdAt,
                    },
                    userCredentialId: userCredential.userCredentialId
                }
                const { stateId, expiresAt } = await addCookieState(data);

                response.setCookie("state", stateId, {
                    path: "/",
                    signed: true,
                    expires: new Date(expiresAt),
                });
            }
        }


        return { verified, redirectUrl: verified ? redirectUrl : undefined };
    } else if (authentication) {
        ok(reference, `Expected to find reference for user ${state.userId}`);
        const userId = reference.userId;
        const credentials = await listUserCredentials(userId);
        const existingUser = getMaybeUser();
        if (existingUser) {
            ok(existingUser.userId === userId, "Expected userId to match logged in");
        }
        const user = existingUser ?? await getUser(userId);
        const found = credentials.find(credential => credential.credentialId === authentication.id);
        ok(found, `Expected to find credential for user ${userId}`);
        const { hostname, origin } = new URL(getOrigin());
        const { verified, authenticationInfo } = await verifyAuthenticationResponse({
            response: authentication,
            expectedChallenge,
            expectedOrigin: WEBAUTHN_RP_ORIGIN || origin,
            expectedRPID: WEBAUTHN_RP_ID || hostname,
            authenticator: {
                credentialID: new Uint8Array(toArrayBuffer(found.credentialId, true)),
                credentialPublicKey: new Uint8Array(toArrayBuffer(found.credentialPublicKey, true)),
                transports: found.authenticatorTransports,
                counter: found.credentialCounter ?? 0
            }
        });
        if (verified) {
            const { newCounter } = authenticationInfo;
            await setUserCredential({
                ...found,
                credentialCounter: newCounter
            });

            if (!existingUser && response) {
                const userRoles = await getUserAuthenticationRoleForUser(user);

                const data: UntypedAuthenticationStateData & Record<string, unknown> = {
                    userId: user.userId,
                    roles: [...new Set<AuthenticationRole>([
                        "member",
                        ...(userRoles?.roles ?? [])
                    ])],
                    from: {
                        type: "credential",
                        createdAt: state.createdAt,
                    },
                    userCredentialId: found.userCredentialId
                }
                const { stateId, expiresAt } = await addCookieState(data);

                response.setCookie("state", stateId, {
                    path: "/",
                    signed: true,
                    expires: new Date(expiresAt),
                });
            }
        }

        return { verified, redirectUrl: verified ? redirectUrl : undefined };
    } else {
        throw new Error("Unknown verication type")
    }

    type WithChallenge = AuthenticationState & { challenge: string, authenticatorType?: string };

    function assertChallenge(state?: AuthenticationState): asserts state is WithChallenge {
        ok<WithChallenge>(state, INVALID_MESSAGE);
        ok(state.challenge, INVALID_MESSAGE)
    }
}