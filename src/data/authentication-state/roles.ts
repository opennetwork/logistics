import { ok } from "../../is";
import { AuthenticationRole, SystemRole } from "../authentication-role";

export const namedRoles: Record<
  Exclude<AuthenticationRole, SystemRole>,
  string
> = {
  admin: "Admin",
  industry: "Industry",
  member: "Member",
  moderator: "Moderator",
  owner: "Owner",
  booster: "Discord Server Booster",
  developer: "Software Developer",
  coordinator: "Coordinator",
  partner: "Partner",
};

export const alternativeRoleNames: Partial<
  Record<AuthenticationRole, string[]>
> = {
  member: ["Contributor", "Subscriber"],
  booster: ["Server Booster"],
  developer: ["Software Engineer", "Developer"],
  coordinator: [
    "Community Coordinator",
    "Community Organiser",
    "Community Organizer",
  ],
  industry: ["Verified Industry"],
};

export const roles: AuthenticationRole[] = [
  "admin",
  "industry",
  "member",
  "moderator",
  "owner",
  "developer",
  "coordinator",
  "booster",
  "partner",
];
const stringRoles: string[] = roles;

ok(
  Object.keys(namedRoles).length === roles.length,
  "Expected roles array to include all named roles"
);

export function isAuthenticationRole(key: string): key is AuthenticationRole {
  return stringRoles.includes(key);
}

export function getAuthenticationRole(
  name: string
): AuthenticationRole | undefined {
  const lowerName = name.toLowerCase();
  if (isAuthenticationRole(lowerName)) return lowerName;
  for (const key of roles) {
    if (key === "system") continue;
    if (name === key || lowerName === key) return key;
    for (const value of [
      namedRoles[key],
      ...(alternativeRoleNames[key] ?? []),
    ]) {
      if (name === value) return key;
      const lower = value.toLowerCase();
      if (lowerName === lower) return key;
    }
  }
  return undefined;
}

export function getAuthenticationRoles(names: string[]): AuthenticationRole[] {
  const result = names
    .filter(Boolean)
    .map(getAuthenticationRole)
    .filter(Boolean);
  return [...new Set(result)];
}
