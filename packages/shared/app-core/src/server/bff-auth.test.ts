import { describe, expect, it, vi } from 'vitest';
import { createAuthBffHandler } from './bff-auth';

const tokens = {
  accessToken: 'a1',
  accessTokenExpiresAt: '2030-01-01T00:00:00Z',
  refreshToken: 'r1',
  refreshTokenExpiresAt: '2030-02-01T00:00:00Z',
  user: { id: 'u1' },
  isNewUser: false,
};
const ctx = (action: string) => ({ params: Promise.resolve({ action }) });

describe('auth BFF', () => {
  it('moves the refresh token into an httpOnly cookie on verify', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(tokens), { status: 200 }));
    const handler = createAuthBffHandler({ apiUrl: 'http://api', fetchImpl });
    const res = await handler(new Request('http://app/bff/auth/verify', { method: 'POST', body: '{"requestId":"x","code":"1"}' }), ctx('verify'));
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.refreshToken).toBeUndefined();
    expect(body.accessToken).toBe('a1');
    expect(res.headers.get('set-cookie')).toMatch(/dukani_rt=r1; Path=\/bff\/auth; HttpOnly; SameSite=Lax; Secure; Expires=/);
    expect(fetchImpl).toHaveBeenCalledWith('http://api/api/v1/auth/otp/verify', expect.objectContaining({ method: 'POST' }));
  });

  it('refreshes from the cookie and clears it when the API rejects', async () => {
    const fetchImpl = vi.fn(async () => new Response('{"code":"REFRESH_TOKEN_INVALID"}', { status: 401 }));
    const handler = createAuthBffHandler({ apiUrl: 'http://api', fetchImpl });
    const res = await handler(new Request('http://app/bff/auth/refresh', { method: 'POST', headers: { cookie: 'x=1; dukani_rt=r1' } }), ctx('refresh'));
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0');
    expect(JSON.parse(String((fetchImpl.mock.calls[0] as unknown[])[1] && ((fetchImpl.mock.calls[0] as unknown[])[1] as RequestInit).body))).toEqual({ refreshToken: 'r1' });
  });

  it('answers 401 without calling the API when there is no cookie', async () => {
    const fetchImpl = vi.fn();
    const res = await createAuthBffHandler({ apiUrl: 'http://api', fetchImpl })(new Request('http://app/bff/auth/refresh', { method: 'POST' }), ctx('refresh'));
    expect(res.status).toBe(401);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
