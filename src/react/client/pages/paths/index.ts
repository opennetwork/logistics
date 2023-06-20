
async function home() {
  const { home: fn } = await import("./home");
  return fn();
}

async function login() {
  const { login: fn } = await import("./login");
  return fn();
}

export const paths: Record<string, () => void | Promise<void>> = {
  "/": home,
  "/home": home,
  "/login": login
};

export function runPath() {
  const { pathname } = window.location;
  const pathFn = paths[pathname];
  if (!pathFn) return;
  return pathFn();
}
