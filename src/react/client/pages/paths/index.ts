

export const paths: Record<string, () => void | Promise<void>> = {
  // "/page/path": pageFunction,
};

export function runPath() {
  const { pathname } = window.location;
  const pathFn = paths[pathname];
  if (!pathFn) return;
  return pathFn();
}
