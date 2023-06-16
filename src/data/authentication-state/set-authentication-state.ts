import { AuthenticationState, AuthenticationStateData } from "./types";
import {
  DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
  getAuthenticationStateStore,
} from "./store";
import { getExpiresAt } from "../expiring-kv";
import {v4} from "uuid";

export async function setAuthenticationState(
  data: AuthenticationStateData & Partial<AuthenticationState>
) {
  const stateId = data.stateId || v4();
  const stateKey = data.stateKey || stateId;
  const createdAt = data.createdAt || new Date().toISOString();
  const state: AuthenticationState = {
    createdAt,
    ...data,
    stateId,
    stateKey,
    expiresAt: getExpiresAt(
      DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
      data.expiresAt
    ),
  };
  const store = getAuthenticationStateStore();
  await store.set(stateId, state);
  return state;
}
