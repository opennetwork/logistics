import {FastifyInstance} from "fastify";
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
    AuthenticationResponseJSON,
    PublicKeyCredentialDescriptorFuture,
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

const INVALID_MESSAGE = "Authentication state invalid or expired";

export async function webauthnRoutes(fastify: FastifyInstance) {
    const {
        WEBAUTHN_RP_NAME = name,
        WEBAUTHN_RP_ID,
        WEBAUTHN_RP_ORIGIN,
        WEBAUTHN_REDIRECT_URL = "/"
    } = process.env;

    if (!WEBAUTHN_RP_ID) return;
    if (!WEBAUTHN_RP_ORIGIN) return;

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
        interface Body extends Pick<UserCredential, "authenticatorType"> {
            email?: string
            redirectUrl?: string;
            registration?: Partial<GenerateRegistrationOptionsOpts>
            authentication?: Partial<GenerateAuthenticationOptionsOpts>
        }
        type Schema = {
            Body: Body
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.post<Schema>("/webauthn/generate-options", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                const { email, authenticatorType, registration, authentication, redirectUrl } = request.body;
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

                response.send({
                    registration: await registrationPromise,
                    authentication: await authenticationPromise,
                });

                async function createAuthentication() {

                    console.log(credentials);

                    const matchingType = credentials.filter(
                        credential => credential.authenticatorType === authenticatorType
                    );

                    if (!matchingType.length) return undefined;

                    const allowCredentials = credentials.map((credential): PublicKeyCredentialDescriptorFuture => ({
                        id: toArrayBuffer(credential.credentialId),
                        type: "public-key",
                        transports: credential.authenticatorTransports
                    }));

                    const options = generateAuthenticationOptions({
                        userVerification: "preferred",
                        ...authentication,
                        allowCredentials,
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

                    const options = generateRegistrationOptions({
                        // Don't prompt users for additional information about the authenticator
                        // (Recommended for smoother UX)
                        attestationType: "none",
                        // Prevent users from re-registering existing authenticators
                        excludeCredentials,
                        ...registration,
                        rpName: WEBAUTHN_RP_NAME,
                        rpID: WEBAUTHN_RP_ID,
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
                    const hash = createHash("sha256");
                    hash.update(WEBAUTHN_RP_ID);
                    hash.update(email);
                    return hash.digest().toString("hex");
                }
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
        type Body = {
            registration?: RegistrationResponseJSON;
            authentication?: AuthenticationResponseJSON;
            state: string;
        }
        type Schema = {
            Body: Body
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.post<Schema>("/webauthn/verify", {
            schema,
            preHandler: authenticate(fastify, {anonymous: true}),
            async handler(request, response) {
                const state = await getAuthenticationState(request.body.state);
                assertChallenge(state);
                await deleteAuthenticationState(state.stateId);

                const reference = await getExternalReference("credential", state.externalId);
                const existingUser = getMaybeUser();

                const { registration, authentication } = request.body;

                if (registration && reference && !existingUser) {
                    throw new Error("Login required before linking user");
                }
                if (reference && existingUser && reference.userId !== existingUser.userId) {
                    throw new Error("Expected user to be logged in");
                }

                const expectedChallenge = state.challenge;
                const redirectUrl = state.redirectUrl || WEBAUTHN_REDIRECT_URL || "/";

                try {
                    if (registration) {
                        console.log(registration);
                        ok<RegistrationResponseJSON>(body);
                        const { verified, registrationInfo } = await verifyRegistrationResponse({
                            response: registration,
                            expectedChallenge,
                            expectedOrigin: WEBAUTHN_RP_ORIGIN,
                            expectedRPID: WEBAUTHN_RP_ID
                        });

                        const existingUser = getMaybeUser();
                        const user = await addExternalUser({
                            externalType: "credential",
                            externalId: state.externalId
                        }, existingUser);

                        if (verified) {

                            console.log(registrationInfo);
                            const { credentialPublicKey, credentialID, counter } = registrationInfo;
                            const userCredential = await setUserCredential({
                                userId: user.userId,
                                credentialId: fromArrayBuffer(credentialID, true),
                                credentialPublicKey: fromArrayBuffer(credentialPublicKey, true),
                                credentialCounter: counter,
                                authenticatorType: state.authenticatorType,
                                verifiedAt: new Date().toISOString()
                            });

                            if (!existingUser) {
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


                        response.send({ verified, redirectUrl: verified ? redirectUrl : undefined });
                    } else if (authentication) {
                        console.log(authentication);
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
                        const { verified, authenticationInfo } = await verifyAuthenticationResponse({
                            response: authentication,
                            expectedChallenge,
                            expectedOrigin: WEBAUTHN_RP_ORIGIN,
                            expectedRPID: WEBAUTHN_RP_ID,
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

                            if (!existingUser) {
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

                        response.send({ verified, redirectUrl: verified ? redirectUrl : undefined });
                    } else {
                        response.status(400);
                    }
                } catch (error) {
                    console.error(error);
                    response.status(400);
                    response.send({ error: error.message })
                    return;
                }

                type WithChallenge = AuthenticationState & { challenge: string, authenticatorType?: string };

                function assertChallenge(state?: AuthenticationState): asserts state is WithChallenge {
                    ok<WithChallenge>(state, INVALID_MESSAGE);
                    ok(state.challenge, INVALID_MESSAGE)
                }
            }
        });
    }
}