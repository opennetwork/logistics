export type SystemRole = "system";

export type AuthenticationRole =
  | "moderator"
  | "admin"
  | "owner"
  | "member"
  | "booster"
  | "industry"
  | "developer"
  | "coordinator"
  | "partner"
  | SystemRole;
