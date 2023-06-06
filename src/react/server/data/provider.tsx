import {
  AuthenticationRole,
  Partner,
  Organisation,
  User,
} from "../../../data";
import {createContext, PropsWithChildren, ProviderProps, useContext, useMemo} from "react";
import { ok } from "../../../is";
import { TimezoneProvider } from "../../client/components/happening";

const TRUSTED_ROLE: AuthenticationRole[] = ["moderator", "admin", "developer"];

export interface Data {
  body?: unknown;
  input?: unknown;
  result?: unknown;
  error?: unknown;
  query?: unknown;
  submitted?: true;
  timezone: string;
  url: string;
  isAnonymous: boolean;
  isFragment: boolean;
  organisations: Organisation[];
  partners?: Partner[];
  user?: User
  roles?: AuthenticationRole[];
}

export const DataContext = createContext<Data | undefined>(undefined);

export function DataProvider({ children, ...props }: ProviderProps<Data>) {
  return (
      <DataContext.Provider {...props}>
        <TimezoneProvider value={props.value.timezone}>
          {children}
        </TimezoneProvider>
      </DataContext.Provider>
  )
}

export function useData(): Data {
  const context = useContext(DataContext);
  ok(context, "Expected DataProvider to be used");
  return context;
}

export function useMaybeUser(): User | undefined {
  const { user } = useData();
  return user;
}

export function useUser(): User {
  const user = useMaybeUser();
  ok(user, "Expected user");
  return user;
}

export function useMaybeBody<B>(): B | undefined {
  const { body } = useData();
  if (!body) return undefined;
  ok<B>(body);
  return body;
}

export function useBody<B>(): B {
  const body = useMaybeBody<B>();
  ok(body, "Expected body");
  return body;
}

type QueryRecord = Record<string, string>;

export function useQuery<Q = QueryRecord>(): Q {
  const { query } = useData();
  const queryValue = query || {};
  ok<Q>(queryValue, "Expected query");
  return queryValue;
}

export function useQuerySearch() {
  const query = useQuery();
  return query.search || query.productName || "";
}

export function useMaybeResult<R>(): R | undefined {
  const { result } = useData();
  if (!result) return undefined;
  ok<R>(result);
  return result;
}

export function useResult<R>(): R {
  const result = useMaybeResult<R>();
  ok(result, "Expected result");
  return result;
}

export function useMaybeInput<I>(): I | undefined {
  const { input } = useData();
  if (!input) return undefined;
  ok<I>(input);
  return input;
}

export function useInput<I>(): I {
  const input = useMaybeInput<I>();
  ok(input, "Expected input");
  return input;
}

export function useError(): unknown | undefined {
  const { error } = useData();
  return error;
}

export function useSubmitted(): boolean {
  const { submitted } = useData();
  return !!submitted;
}

export function usePartners() {
  const { partners } = useData();
  return useMemo(() => partners || [], [partners]);
}

export function usePartner(partnerId: string) {
  const partners = usePartners();
  return useMemo(
      () => partners.find((partner) => partner.partnerId === partnerId),
      [partners]
  );
}

export function useOrganisations() {
  const { organisations } = useData();
  return organisations;
}

export function useRoles() {
  const { roles } = useData();
  return useMemo(() => roles ?? [], [roles]);
}

export function useIsRole(role: AuthenticationRole) {
  const roles = useRoles();
  return useMemo(() => isRole(roles, role), [roles, role]);
}

function isRole(
  roles: AuthenticationRole[] | undefined,
  role: AuthenticationRole
) {
  if (!roles) return false;
  return roles.includes(role);
}


export function useIsTrusted() {
  const roles = useRoles();
  return useMemo(() => {
    return !!TRUSTED_ROLE.find((role) => isRole(roles, role));
  }, [roles]);
}

export function useIsModerator() {
  return useIsRole("moderator");
}

export function useIsAdmin() {
  return useIsRole("admin");
}

export function useTimezone() {
  const { timezone } = useData();
  return timezone;
}