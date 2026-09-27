import type { SessionState, SessionTokens } from './session';

/** Shared state handling for session adapters. */
export const createSessionCore = () => {
  let accessToken: string | null = null;
  let state: SessionState = { status: 'unknown' };
  const listeners = new Set<(s: SessionState) => void>();
  const set = (s: SessionState) => {
    state = s;
    listeners.forEach((l) => l(s));
  };
  return {
    getAccessToken: () => accessToken,
    getState: () => state,
    subscribe: (l: (s: SessionState) => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    apply(tokens: SessionTokens | null) {
      accessToken = tokens?.accessToken ?? null;
      set(tokens ? { status: 'signed-in', user: tokens.user } : { status: 'signed-out' });
    },
  };
};

/** Runs one refresh at a time; concurrent 401s wait for the same promise. */
export const singleFlight = <T>(fn: () => Promise<T>) => {
  let pending: Promise<T> | null = null;
  return () => (pending ??= fn().finally(() => (pending = null)));
};
