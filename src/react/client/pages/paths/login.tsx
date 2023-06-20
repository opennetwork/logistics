import {ok} from "../../utils";
import {browserSupportsWebAuthn} from "@simplewebauthn/browser";
import {Authsignal} from "@authsignal/browser";

export async function login() {

    console.log("Hello from login!");

    if (!browserSupportsWebAuthn()) {
        console.log("Browser does not support WebAuthn")
        return;
    }
    console.log("Browser does support WebAuthn");

    const form = document.getElementById("login-authsignal");
    ok<HTMLFormElement>(form);

    const tenantIdMeta = form.querySelector("meta[name=authsignal-tenant-id]");
    const regionMeta = form.querySelector("meta[name=authsignal-region]");
    const trackMeta = form.querySelector("meta[name=authsignal-track-url]");

    ok<HTMLMetaElement>(tenantIdMeta);
    ok<HTMLMetaElement>(regionMeta);
    ok<HTMLMetaElement>(trackMeta);

    const trackUrl = trackMeta.content;

    const input = form.querySelector("input[name=email]");
    ok<HTMLInputElement>(input);

    const submit = form.querySelector("button[type=submit]");
    ok<HTMLButtonElement>(submit);

    submit.textContent = "Login with Passkey";

    /*

        <meta name="authsignal-tenant-id" content={AUTHSIGNAL_TENANT} />
        <meta name="authsignal-region" content={AUTHSIGNAL_BASE_URL} />
     */

    const authsignal = new Authsignal({
        tenantId: tenantIdMeta.content,
        baseUrl: regionMeta.content
    });

    console.log({ authsignal });

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (!input.value?.trim()) {
            return;
        }

        input.disabled = true;
        submit.disabled = true;
        void onSubmit()
            .finally(() => {
                input.disabled = false;
                submit.disabled = false;
            });
    })

    async function onSubmit() {
        ok<HTMLFormElement>(form);
        ok<HTMLInputElement>(input);

        const email = input.value;

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

        const {
            token,
            enrolledVerificationMethods,
            redirectUrl
        } = await response.json();

        const isPasskeyEnrolled = enrolledVerificationMethods?.includes("PASSKEY");

        console.log({
            isPasskeyEnrolled
        })

        let accessToken;
        if (isPasskeyEnrolled) {
            accessToken = await authsignal.passkey.signIn({
                token
            })
        } else {
            accessToken = await authsignal.passkey.signUp({
                userName: email,
                token
            })
        }

        console.log({ email, accessToken });

        const redirectingUrl = new URL(
            redirectUrl,
            location.href
        );

        redirectingUrl.searchParams.set("token", accessToken);

        location.href = redirectingUrl.toString();
    }
}