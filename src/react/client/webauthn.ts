import {GenerateRegistrationOptionsOpts} from "@simplewebauthn/server/dist/registration/generateRegistrationOptions";
import {GenerateAuthenticationOptionsOpts} from "@simplewebauthn/server";
import {
    AuthenticationResponseJSON,
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON
} from "@simplewebauthn/typescript-types";
import {startAuthentication, startRegistration} from "@simplewebauthn/browser";

export interface AuthenticateOptions extends WebAuthnOptionsOptions {
    payment?: boolean;
}

export async function authenticate(options: AuthenticateOptions) {

    if (options.payment) {
        options = {
            ...options,
            registration: {
                ...options.registration,
                authenticatorSelection: {
                    userVerification: "required",
                    residentKey: "required",
                    authenticatorAttachment: "platform",
                },
                extensions: {
                    "payment": {
                        isPayment: true,
                    }
                }
            }
        }

        if (!options.authenticatorType) {
            options = {
                ...options,
                authenticatorType: "payment"
            }
        }
    }

    if (!options.authenticatorType) {
        options = {
            ...options,
            authenticatorType: "credential"
        }
    }

    const { registration, authentication } = await generateOptions(options);

    let response;
    if (options.register || !authentication) {
        if (!registration) {
            return alert("Can only register new credentials on original device");
        }
        response = await verify({
            registration: await startRegistration(registration.options),
            state: registration.state
        });
    } else {
        response = await verify({
            authentication: await startAuthentication(authentication.options),
            state: authentication.state
        });
    }

    if (response?.verified && response?.redirectUrl) {
        location.href = response.redirectUrl;
    }
}

export interface WebAuthnOptionsOptions {
    email?: string
    register?: boolean;
    authenticatorType?: string;
    registration?: Record<string, unknown>
    authentication?: Record<string, unknown>
}

export interface WebAuthnOptionsResponse {
    registration: {
        state: string;
        options: PublicKeyCredentialCreationOptionsJSON
    },
    authentication?: {
        state: string;
        options: PublicKeyCredentialRequestOptionsJSON;
    }
}

async function generateOptions(options: WebAuthnOptionsOptions): Promise<WebAuthnOptionsResponse> {
    const response = await fetch("/api/authentication/webauthn/generate-options", {
        method: "POST",
        body: JSON.stringify(options),
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.json();
}

interface VerifyOptions {
    registration?: RegistrationResponseJSON;
    authentication?: AuthenticationResponseJSON;
    state: string;
}

interface VerifyResponse {
    verified: boolean;
    redirectUrl?: string;
}

async function verify(options: VerifyOptions): Promise<VerifyResponse> {
    const response = await fetch("/api/authentication/webauthn/verify", {
        method: "POST",
        body: JSON.stringify(options),
        headers: {
            "Content-Type": "application/json"
        }
    });
    return response.json();
}