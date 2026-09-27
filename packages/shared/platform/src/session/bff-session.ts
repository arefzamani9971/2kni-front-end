import type { Session, SessionTokens } from './session';
import { createSessionCore, singleFlight } from './session-base';

/**
 * Live adapter. `/bff/auth/verify|refresh|logout` are Next.js route handlers of the same app
 * (`@dukani/app-core/server`): they call the API and keep the refresh token in an httpOnly Secure cookie.
 */
export const createBffSession = (opts: { basePath?: string; onExpired?: () => void } = {}): Session => {
  const base = opts.basePath ?? '/bff/auth';
  const core = createSessionCore();
  const refresh = singleFlight(async () => {
    const res = await fetch(`${base}/refresh`, { method: 'POST', credentials: 'same-origin' }).catch(() => null);
    if (!res?.ok) {
      core.apply(null);
      return false;
    }
    core.apply((await res.json()) as SessionTokens);
    return true;
  });
  return {
    getAccessToken: core.getAccessToken,
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
      await fetch(`${base}/logout`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => undefined);
      core.apply(null);
    },
    async restore() {
      await refresh();
      return core.getState();
    },
  };
};
