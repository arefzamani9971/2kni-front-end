/**
 * BFF auth route handlers (live mode). The refresh token never reaches JavaScript: it lives in an
 * httpOnly, Secure, SameSite=Lax cookie scoped to `/bff/auth`. The browser only receives the
 * short-lived access token. Uses Web `Request`/`Response`, so it runs in any Next.js route handler:
 *
 *   // app/bff/auth/[action]/route.ts
 *   export const POST = createAuthBffHandler({ apiUrl: process.env.API_INTERNAL_URL! });
 */
export type AuthBffOptions = {
  /** API origin reachable from the Next.js server (inside Docker: http://api:8080). */
  readonly apiUrl: string;
  readonly cookieName?: string;
  readonly cookiePath?: string;
  /** Default true; false only for http://localhost development. */
  readonly secure?: boolean;
  readonly fetchImpl?: typeof fetch;
};

export type TokensDto = { refreshToken?: string; refreshTokenExpiresAt?: string } & Record<string, unknown>;
