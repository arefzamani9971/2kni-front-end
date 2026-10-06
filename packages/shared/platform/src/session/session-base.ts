import type { SessionState, SessionTokens } from './session.types';

/** Shared state handling for session adapters. */
export const createSessionCore = () => {
  let accessToken: string | null = null;
  let version = 0;
  let controller = new AbortController();
  let state: SessionState = { status: 'unknown' };
  const listeners = new Set<(s: SessionState) => void>();
  const set = (s: SessionState) => {
    state = s;
    listeners.forEach((l) => l(s));
  };
  return {
    getAccessToken: () => accessToken,
    getSessionVersion: () => version,
    getSessionSignal: () => controller.signal,
    assertCurrent: (expected: number) => {
      if (expected !== version) throw new DOMException('Session changed', 'AbortError');
    },
    getState: () => state,
    subscribe: (l: (s: SessionState) => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    apply(tokens: SessionTokens | null, renewal = false) {
      if (!renewal || state.status !== 'signed-in' || state.user.id !== tokens?.user.id) {
        version++;
        controller.abort();
        controller = new AbortController();
      }
      accessToken = tokens?.accessToken ?? null;
      set(tokens ? { status: 'signed-in', user: tokens.user } : { status: 'signed-out' });
    },
  };
};

/** Runs one refresh at a time; concurrent 401s wait for the same promise. */
export const singleFlight = <T>(fn: () => Promise<T>, generation: () => number = () => 0) => {
  let pending: { version: number; promise: Promise<T> } | null = null;
  return () => {
    const version = generation();
    if (pending?.version === version) return pending.promise;
    const promise = fn().finally(() => {
      if (pending?.promise === promise) pending = null;
    });
    pending = { version, promise };
    return promise;
  };
};
