import {Authsignal} from "@authsignal/browser";
import {ok} from "./utils";

interface AuthsignalMeta {
    tenantId: string;
    baseUrl: string;
    trackUrl: string;
}

export function getAuthsignalMeta(element = document.body): AuthsignalMeta {
    const tenantIdMeta = element.querySelector("meta[name=authsignal-tenant-id]");
    const regionMeta = element.querySelector("meta[name=authsignal-region]");
    const trackMeta = element.querySelector("meta[name=authsignal-track-url]");

    ok<HTMLMetaElement>(tenantIdMeta);
    ok<HTMLMetaElement>(regionMeta);
    ok<HTMLMetaElement>(trackMeta);

    return {
        tenantId: tenantIdMeta.content,
        baseUrl: regionMeta.content,
        trackUrl: trackMeta.content
    };
}

const clients = new WeakMap<AuthsignalMeta, Authsignal>();

export function getAuthsignalClient(meta = getAuthsignalMeta()) {
    const existing = clients.get(meta);
    if (existing) return existing;
    const { tenantId, baseUrl } = meta;
    const client = new Authsignal({ tenantId, baseUrl });
    clients.set(meta, client);
    return client;
}

export async function passkey(email: string, meta: AuthsignalMeta = getAuthsignalMeta()) {
    const { baseUrl } = meta;
    const {
        token,
        enrolledVerificationMethods,
        redirectUrl
    } = await track();

    const accessToken = await getAccessToken();
    const credential = await getCredential()

    const redirectingUrl = new URL(
        redirectUrl,
        location.href
    );

    for (const [key, value] of Object.entries(credential)) {
        if (typeof value !== "string") continue;
        redirectingUrl.searchParams.set(key, value);
    }

    redirectingUrl.searchParams.set("token", accessToken);

    location.href = redirectingUrl.toString();

    interface TrackResponse {
        token: string;
        enrolledVerificationMethods: string[];
        redirectUrl: string;
    }

    async function getAccessToken() {
        const isPasskeyEnrolled = enrolledVerificationMethods?.includes("PASSKEY");

        const authsignal = getAuthsignalClient(meta);

        if (isPasskeyEnrolled) {
            return await authsignal.passkey.signIn({
                token
            })
        } else {
            return await authsignal.passkey.signUp({
                userName: email,
                token
            })
        }

    }

    async function track(): Promise<TrackResponse> {
        const { trackUrl } = meta;
        const response = await fetch(
            trackUrl,
            {
                method: "POST",
                body: JSON.stringify({
                    email
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            },
        );
        return await response.json();
    }

    async function getCredential(): Promise<{ deviceId: string, credentialId: string } | undefined> {
        const response = await fetch(
            new URL(
                "/v1/user-authenticators",
                baseUrl
            ),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        const authenticators = await response.json();
        ok(Array.isArray(authenticators));
        const found = authenticators.find(authenticator => authenticator.verificationMethod === "PASSKEY");
        return found?.webauthnCredential
    }
}