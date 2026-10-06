import { appError } from '@dukani/domain';
import { createBffSession } from './bff-session';
import { createMemorySession } from './memory-session';
import { createMemoryStorage } from '../storage/key-value-storage';
import type { SessionTokens } from './session.types';

const tokens = (id: string): SessionTokens => ({
  accessToken: id,
  refreshToken: `r-${id}`,
  accessTokenExpiresAt: '2030-01-01',
  user: { id, mobile: '09123456789', displayName: null, defaultStoreId: null, platformRoles: [] },
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
afterEach(() => vi.unstubAllGlobals());

describe('BFF session', () => {
  it.each([429, 500, 502])('preserves the session on refresh HTTP %s', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status })),
    );
    const session = createBffSession();
    await session.signIn(tokens('a'));
    const version = session.getSessionVersion();
    await expect(session.refresh()).rejects.toMatchObject({ code: 'REFRESH_UNAVAILABLE' });
    expect(session.getAccessToken()).toBe('a');
    expect(session.getSessionVersion()).toBe(version);
  });
  it('allows retry after failed startup restore without marking the user signed out', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(Response.json(tokens('a')));
    vi.stubGlobal('fetch', fetcher);
    const session = createBffSession();
    await expect(session.restore()).rejects.toMatchObject({ code: 'REFRESH_UNAVAILABLE' });
    expect(session.getState().status).toBe('unknown');
    expect((await session.restore()).status).toBe('signed-in');
  });
  it('signs out on definitive rejection during restore', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 401 })),
    );
    expect((await createBffSession().restore()).status).toBe('signed-out');
  });
  it('shares concurrent renewals and preserves the cache version on successful refresh', async () => {
    const response = deferred<Response>();
    const fetcher = vi.fn(() => response.promise);
    vi.stubGlobal('fetch', fetcher);
    const session = createBffSession();
    await session.signIn(tokens('a'));
    const version = session.getSessionVersion();
    const first = session.refresh();
    const second = session.refresh();
    expect(first).toBe(second);
    response.resolve(Response.json({ ...tokens('a'), accessToken: 'rotated' }));
    await first;
    expect(session.getSessionVersion()).toBe(version);
    expect(session.getAccessToken()).toBe('rotated');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('ignores a late refresh after logout and a new login, even if fetch ignores abort', async () => {
    const response = deferred<Response>();
    const logout = deferred<Response>();
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => (url.endsWith('logout') ? logout.promise : response.promise)),
    );
    const session = createBffSession();
    await session.signIn(tokens('a'));
    const oldSignal = session.getSessionSignal();
    const refresh = session.refresh();
    const rejected = expect(refresh).rejects.toMatchObject({ name: 'AbortError' });
    const leaving = session.signOut();
    expect(session.getState().status).toBe('signed-out');
    expect(oldSignal.aborted).toBe(true);
    await session.signIn(tokens('b'));
    response.resolve(Response.json(tokens('a')));
    await rejected;
    logout.resolve(new Response(null, { status: 204 }));
    await leaving;
    expect(session.getAccessToken()).toBe('b');
  });
});

describe('memory session', () => {
  it('keeps saved tokens on a temporary refresh failure', async () => {
    const storage = createMemoryStorage();
    const session = createMemorySession(storage, {
      renew: async () => {
        throw appError('Server', 'DOWN', 'down');
      },
    });
    await session.signIn(tokens('a'));
    await expect(session.refresh()).rejects.toMatchObject({ code: 'DOWN' });
    expect(storage.get('session')).toEqual(tokens('a'));
    expect(session.getAccessToken()).toBe('a');
  });
  it('clears rejected credentials on restore', async () => {
    const storage = createMemoryStorage();
    storage.set('session', { ...tokens('a'), accessTokenExpiresAt: '2000-01-01' });
    const session = createMemorySession(storage, {
      renew: async () => {
        throw appError('Unauthorized', 'REFRESH_TOKEN_INVALID', 'expired');
      },
    });
    expect((await session.restore()).status).toBe('signed-out');
    expect(storage.get('session')).toBeNull();
  });
  it('isolates in-flight renewals by login generation and rejects old results', async () => {
    const storage = createMemoryStorage();
    const old = deferred<SessionTokens>();
    const renew = vi.fn().mockReturnValueOnce(old.promise).mockResolvedValueOnce(tokens('b'));
    const session = createMemorySession(storage, { renew });
    await session.signIn(tokens('a'));
    const first = session.refresh();
    const rejected = expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await session.signOut();
    await session.signIn(tokens('b'));
    await session.refresh();
    old.resolve(tokens('a'));
    await rejected;
    expect(storage.get('session')).toEqual(tokens('b'));
    expect(renew).toHaveBeenCalledTimes(2);
    const version = session.getSessionVersion();
    await session.signIn(tokens('b'));
    expect(session.getSessionVersion()).toBeGreaterThan(version);
  });
});
