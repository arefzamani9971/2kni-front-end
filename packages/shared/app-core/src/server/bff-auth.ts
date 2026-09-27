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

type TokensDto = { refreshToken?: string; refreshTokenExpiresAt?: string } & Record<string, unknown>;

const cookie = (o: Required<Omit<AuthBffOptions, 'fetchImpl' | 'apiUrl'>>, value: string, expires: Date | null) =>
  [
    `${o.cookieName}=${value}`,
    `Path=${o.cookiePath}`,
    'HttpOnly',
    'SameSite=Lax',
    o.secure ? 'Secure' : '',
    expires ? `Expires=${expires.toUTCString()}` : 'Max-Age=0',
  ]
    .filter(Boolean)
    .join('; ');

const readCookie = (req: Request, name: string) =>
  req.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === name)?.[1] ?? null;

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

export const createAuthBffHandler = (options: AuthBffOptions) => {
  const o = {
    cookieName: options.cookieName ?? 'dukani_rt',
    cookiePath: options.cookiePath ?? '/bff/auth',
    secure: options.secure ?? true,
  };
  const doFetch = options.fetchImpl ?? fetch;
  const api = (path: string, init: RequestInit) =>
    doFetch(`${options.apiUrl.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
      cache: 'no-store',
    });

  /** Strips the refresh token from the body and moves it into the cookie. */
  const issue = async (res: Response) => {
    const body = (await res.json()) as TokensDto;
    const { refreshToken, refreshTokenExpiresAt, ...rest } = body;
    const expires = refreshTokenExpiresAt ? new Date(refreshTokenExpiresAt) : new Date(Date.now() + 30 * 86400_000);
    return json(rest, 200, { 'Set-Cookie': cookie(o, refreshToken ?? '', expires) });
  };
  const passThrough = async (res: Response, clear = false) =>
    new Response(await res.text(), {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/problem+json',
        'Cache-Control': 'no-store',
        ...(clear ? { 'Set-Cookie': cookie(o, '', null) } : {}),
      },
    });

  return async (request: Request, ctx: { params: Promise<{ action: string }> }): Promise<Response> => {
    const { action } = await ctx.params;
    try {
      if (action === 'verify') {
        const res = await api('/api/v1/auth/otp/verify', { method: 'POST', body: await request.text() });
        return res.ok ? issue(res) : passThrough(res);
      }
      if (action === 'refresh') {
        const refreshToken = readCookie(request, o.cookieName);
        if (!refreshToken) return json({ status: 401, code: 'REFRESH_TOKEN_INVALID', title: 'نشست پیدا نشد.' }, 401);
        const res = await api('/api/v1/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
        return res.ok ? issue(res) : passThrough(res, true);
      }
      if (action === 'logout') {
        const authorization = request.headers.get('authorization');
        if (authorization) await api('/api/v1/auth/logout', { method: 'POST', headers: { Authorization: authorization } }).catch(() => null);
        return json(undefined, 204, { 'Set-Cookie': cookie(o, '', null) });
      }
      return json({ status: 404, code: 'NOT_FOUND', title: 'مسیر پیدا نشد.' }, 404);
    } catch {
      return json({ status: 502, code: 'BFF_UPSTREAM', title: 'ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.' }, 502);
    }
  };
};
