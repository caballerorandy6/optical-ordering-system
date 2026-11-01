/**
 * Public demo: the sign-in page shows shared accounts, so anyone can log in as
 * an administrator. On Vercel the app is read-only unless DEMO_READ_ONLY=0, so
 * a missing variable can never leave the demo writable. Local development stays
 * writable unless DEMO_READ_ONLY=1.
 */
export function isDemoReadOnly(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.DEMO_READ_ONLY === "1") return true;
  if (env.DEMO_READ_ONLY === "0") return false;
  return env.VERCEL === "1";
}

/** The only Better Auth endpoints a read-only demo needs. Everything else is refused. */
const ALLOWED_AUTH_REQUESTS = new Set([
  "POST /api/auth/sign-in/email",
  "POST /api/auth/sign-out",
  "GET /api/auth/get-session",
]);

export function isAuthRequestAllowedInDemo(method: string, pathname: string): boolean {
  return ALLOWED_AUTH_REQUESTS.has(`${method.toUpperCase()} ${pathname}`);
}
