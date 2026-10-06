import type { KeyValueStorage } from '../storage/key-value-storage.types';
import type { Session, SessionTokens } from './session.types';
import { createSessionCore, singleFlight } from './session-base';
import { KEY } from './memory-session.constants';
import { isAppError } from '@dukani/domain';

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
    const version = core.getSessionVersion();
    const saved = storage.get<SessionTokens>(KEY);
    const renewed =
      saved?.refreshToken && opts.renew
        ? await opts.renew(saved.refreshToken).catch((error: unknown) => {
            if (isAppError(error) && error.kind === 'Unauthorized') return null;
            throw error;
          })
        : saved;
    core.assertCurrent(version);
    if (renewed) {
      storage.set(KEY, renewed);
      core.apply(renewed, true);
    }
    return !!renewed;
  }, core.getSessionVersion);
  return {
    getAccessToken: core.getAccessToken,
    getSessionVersion: core.getSessionVersion,
    getSessionSignal: core.getSessionSignal,
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
      const version = core.getSessionVersion();
      if (!(await refresh())) {
        core.assertCurrent(version);
        storage.remove(KEY);
        core.apply(null);
      }
      return core.getState();
    },
  };
};
