import {
  AuthenticationStateData,
} from "./types";
import {
  DEFAULT_COOKIE_STATE_EXPIRES_MS,
} from "./store";
import { getExpiresAt } from "../expiring-kv";
import { setAuthenticationState } from "./set-authentication-state";

export async function addCookieState(data: Partial<AuthenticationStateData>) {
  return addAuthenticationState({
    ...data,
    type: "cookie",
    expiresAt: getExpiresAt(DEFAULT_COOKIE_STATE_EXPIRES_MS, data.expiresAt),
  });
}

export async function addAuthenticationState(data: AuthenticationStateData) {
  return setAuthenticationState(data);
}
