import type { KeyValueStorage } from '../storage/key-value-storage';
import type { Session, SessionTokens } from './session';
import { createSessionCore, singleFlight } from './session-base';

const KEY = 'session';

/**
 * Mock-mode/test adapter: keeps the tokens (refresh token included) in session storage.
 * `renew` exchanges the refresh token (`POST /api/v1/auth/refresh`); without it the saved tokens are re-read.
 * Never used against the live API — there the BFF keeps the refresh token in an httpOnly cookie.
 */
export const createMemorySession = (
  storage: KeyValueStorage,
  opts: { onExpired?: () => void; renew?: (refreshToken: string) => Promise<SessionTokens | null> } = {},
): Session => {
  const core = createSessionCore();
  const refresh = singleFlight(async () => {
    const saved = storage.get<SessionTokens>(KEY);
    const renewed = saved?.refreshToken && opts.renew ? await opts.renew(saved.refreshToken).catch(() => null) : saved;
    if (renewed) storage.set(KEY, renewed);
    else storage.remove(KEY);
    core.apply(renewed);
    return !!renewed;
  });
  return {
    getAccessToken: core.getAccessToken,
    getState: core.getState,
    subscribe: core.subscribe,
    refresh,
    onSessionExpired: () => {
      storage.remove(KEY);
      core.apply(null);
      opts.onExpired?.();
    },
    async signIn(tokens) {
      storage.set(KEY, tokens);
      core.apply(tokens);
    },
    async signOut() {
      storage.remove(KEY);
      core.apply(null);
    },
    async restore() {
      const saved = storage.get<SessionTokens>(KEY);
      if (saved && Date.parse(saved.accessTokenExpiresAt) > Date.now() + 30_000) {
        core.apply(saved);
        return core.getState();
      }
      await refresh();
      return core.getState();
    },
  };
};
