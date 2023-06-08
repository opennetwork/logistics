
async function home() {
  const { home: fn } = await import("./home");
  return fn();
}

export const paths: Record<string, () => void | Promise<void>> = {
  "/": home,
  "/home": home
};

export function runPath() {
  const { pathname } = window.location;
  const pathFn = paths[pathname];
  if (!pathFn) return;
  return pathFn();
}
