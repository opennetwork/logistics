import {FastifyInstance} from "fastify";
import {authenticate} from "../authentication";
import {generateRegistrationOptions, verifyRegistrationResponse} from "@simplewebauthn/server";
import {name} from "../../package";
import {listUserCredentials, setUserCredential} from "../../data/user-credential";
import {getMaybeUser} from "../../authentication";
import {createHash} from "crypto";
import {PublicKeyCredentialDescriptorFuture, RegistrationResponseJSON} from "@simplewebauthn/typescript-types";
import {GenerateRegistrationOptionsOpts} from "@simplewebauthn/server/dist/registration/generateRegistrationOptions";
import {
    AuthenticationState,
    deleteAuthenticationState,
    getAuthenticationState,
    getUser,
    setAuthenticationState
} from "../../data";
import {ok} from "../../is";

const INVALID_MESSAGE = "Authentication state invalid or expired";

export async function webauthnRoutes(fastify: FastifyInstance) {
    const {
        WEBAUTHN_RP_NAME = name,
        WEBAUTHN_RP_ID,
        WEBAUTHN_RP_ORIGIN
    } = process.env;

    if (!WEBAUTHN_RP_ID) return;
    if (!WEBAUTHN_RP_ORIGIN) return;

    {
        const body = {
            type: "object",
            properties: {
                email: {
                    type: "string"
                },
            },
            additionalProperties: true,
            required: ["email"]
        }
        interface Body extends Partial<GenerateRegistrationOptionsOpts> {
            email: string
        }
        type Schema = {
            Body: Body
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.get<Schema>("/webauthn/generate-registration-options", {
            schema,
            preHandler: authenticate(fastify, { anonymous: true }),
            async handler(request, response) {
                const { email, ...baseOptions } = request.body;
                const userId: string = getMaybeUser()?.userId || createUserId();
                const credentials = await listUserCredentials(userId);
                const excludeCredentials = credentials.flatMap((credential) => {
                    return credential.credentialId.split("_")
                        .map(credentialId => ({
                            id: Buffer.from(credentialId, "base64"),
                            type: "public-key",
                            transports: undefined
                        }))
                });
                /*
                rpName: string;
                rpID: string;
                userID: string;
                userName: string;
                challenge?: string | Uint8Array;
                userDisplayName?: string;
                timeout?: number;
                attestationType?: AttestationConveyancePreference;
                excludeCredentials?: PublicKeyCredentialDescriptorFuture[];
                authenticatorSelection?: AuthenticatorSelectionCriteria;
                extensions?: AuthenticationExtensionsClientInputs;
                supportedAlgorithmIDs?: COSEAlgorithmIdentifier[];
                 */
                const options = generateRegistrationOptions({
                    // Don't prompt users for additional information about the authenticator
                    // (Recommended for smoother UX)
                    attestationType: "none",
                    // Prevent users from re-registering existing authenticators
                    excludeCredentials,
                    ...baseOptions,
                    rpName: WEBAUTHN_RP_NAME,
                    rpID: WEBAUTHN_RP_ID,
                    userID: userId,
                    userName: email,
                });

                const { stateKey: state } = await setAuthenticationState({
                    type: "challenge",
                    challenge: options.challenge,
                    userId
                });

                response.header("X-Challenge-State", state);
                response.send(options);

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
            properties: {},
            additionalProperties: true
        };

        interface Body extends Partial<GenerateRegistrationOptionsOpts> {
            email: string
        }

        type Schema = {
            Body: Body
        }
        const schema = {
            body,
            tags: ["system"],
        }

        fastify.get<Schema>("/webauthn/verify-registration", {
            schema,
            preHandler: authenticate(fastify, {anonymous: true}),
            async handler(request, response) {
                const stateKey = new Headers(request.headers).get("X-Challenge-State");
                ok(stateKey, "Expected header X-Challenge-State");
                const {body} = request;

                ok<RegistrationResponseJSON>(body);

                const state = await getAuthenticationState(stateKey);
                assertChallenge(state);
                await deleteAuthenticationState(state.stateId);

                const user = getMaybeUser() ?? await getUser(state.userId);

                const expectedChallenge = state.challenge;

                try {
                    const { verified, registrationInfo } = await verifyRegistrationResponse({
                        response: body,
                        expectedChallenge,
                        expectedOrigin: WEBAUTHN_RP_ORIGIN,
                        expectedRPID: WEBAUTHN_RP_ID
                    });
                    const { credentialPublicKey, credentialID, counter } = registrationInfo;

                    if (verified) {
                        await setUserCredential({
                            userId: state.userId,
                            credentialId: Buffer.from(credentialID).toString("base64"),
                            credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64"),
                            credentialCounter: counter
                        });
                    }

                    response.send({ verified });
                } catch (error) {
                    response.status(400);
                    response.send({ error: error.message })
                    return;
                }


                type WithChallenge = AuthenticationState & { challenge: string };

                function assertChallenge(state?: AuthenticationState): asserts state is WithChallenge {
                    ok<WithChallenge>(state, INVALID_MESSAGE);
                    ok(state.challenge, INVALID_MESSAGE)
                }
            }
        });
    }
}