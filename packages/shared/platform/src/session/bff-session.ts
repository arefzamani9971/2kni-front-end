import type { Session, SessionTokens } from './session.types';
import { createSessionCore, singleFlight } from './session-base';
import { appError } from '@dukani/domain';

/**
 * Live adapter. `/bff/auth/verify|refresh|logout` are Next.js route handlers of the same app
 * (`@dukani/app-core/server`): they call the API and keep the refresh token in an httpOnly Secure cookie.
 */
export const createBffSession = (opts: { basePath?: string; onExpired?: () => void } = {}): Session => {
  const base = opts.basePath ?? '/bff/auth';
  const core = createSessionCore();
  const refresh = singleFlight(async () => {
    const version = core.getSessionVersion();
    const res = await fetch(`${base}/refresh`, {
      method: 'POST',
      credentials: 'same-origin',
      signal: AbortSignal.any([core.getSessionSignal(), AbortSignal.timeout(20_000)]),
    }).catch(() => null);
    core.assertCurrent(version);
    if (res?.status === 401) return false;
    if (!res?.ok)
      throw appError('Server', 'REFRESH_UNAVAILABLE', 'Session refresh is unavailable.', {
        messageSource: 'fallback',
      });
    const tokens = (await res.json()) as SessionTokens;
    core.assertCurrent(version);
    core.apply(tokens, true);
    return true;
  }, core.getSessionVersion);
  return {
    getAccessToken: core.getAccessToken,
    getSessionVersion: core.getSessionVersion,
    getSessionSignal: core.getSessionSignal,
    getState: core.getState,
    subscribe: core.subscribe,
    refresh,
    onSessionExpired: () => {
      core.apply(null);
      opts.onExpired?.();
    },
    async signIn(tokens) {
      core.apply(tokens);
    },
    async signOut() {
      const token = core.getAccessToken();
      core.apply(null);
      await fetch(`${base}/logout`, {
        method: 'POST',
        signal: AbortSignal.timeout(20_000),
        credentials: 'same-origin',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => undefined);
    },
    async restore() {
      const version = core.getSessionVersion();
      if (!(await refresh())) {
        core.assertCurrent(version);
        core.apply(null);
      }
      return core.getState();
    },
  };
};
