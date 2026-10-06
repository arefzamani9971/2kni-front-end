import type { Session, SessionState } from '@dukani/platform';

const restoring = new WeakMap<Session, Promise<SessionState>>();

/** Restores the session once per page load (refresh via BFF cookie or saved mock tokens). */
export const restoreOnce = (session: Session) => {
  const current = restoring.get(session);
  if (current) return current;
  const pending = session.restore().finally(() => restoring.delete(session));
  restoring.set(session, pending);
  return pending;
};
