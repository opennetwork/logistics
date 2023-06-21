import {ok} from "../../utils";
import {browserSupportsWebAuthn} from "@simplewebauthn/browser";
import {authsignalPasskey, isAuthsignalMeta} from "../../authsignal";
import {authenticate} from "../../webauthn";

export async function login() {

    console.log("Hello from login!");

    if (!browserSupportsWebAuthn()) {
        console.log("Browser does not support WebAuthn")
        return;
    }
    console.log("Browser does support WebAuthn");

    const form = document.getElementById("login-authsignal");
    ok<HTMLFormElement>(form);

    const input = form.querySelector("input[name=email]");
    ok<HTMLInputElement>(input);

    const submit = form.querySelector("button[type=submit]");
    ok<HTMLButtonElement>(submit);

    submit.textContent = "Login with Passkey";

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

        if (isAuthsignalMeta(form)) {
            await authsignalPasskey({ email });
        } else {
            await authenticate({ email });
        }
    }
}