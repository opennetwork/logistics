import { Expiring } from "../expiring";
import { AuthenticationRole } from "../authentication-role";

export type AuthenticationStateType =
  | "discord"
  | "reddit"
  | "cookie"
  | "authsignal"
  | "partner"
  | "attendee"
  | "invitee"
  | "exchange"
  | "challenge";

export interface AuthenticationStateFromData {
  type: AuthenticationStateType | string;
  stateId?: string;
  createdAt: string;
  from?: AuthenticationStateFromData;
}

export interface UntypedAuthenticationStateData extends Expiring {
  from?: AuthenticationStateFromData;
  userState?: string;
  externalScope?: string;
  externalState?: string;
  externalKey?: string;
  roles?: AuthenticationRole[];
  partnerId?: string;
  userId?: string;
  redirectUrl?: string;
}

export interface AuthenticationStateData
  extends UntypedAuthenticationStateData,
    Record<string, unknown> {
  type: AuthenticationStateType | string;
}


export interface InviteeData extends Exclude<AuthenticationStateData, "type"> {
  roles: AuthenticationRole[];
}

export interface AuthenticationState
  extends AuthenticationStateData,
    AuthenticationStateFromData {
  stateId: string;
  stateKey: string;
  createdAt: string;
  expiresAt: string;
}
