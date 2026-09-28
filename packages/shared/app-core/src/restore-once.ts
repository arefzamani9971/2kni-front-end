import type { Session, SessionState } from '@dukani/platform';

let restoring: Promise<SessionState> | null = null;

/** Restores the session once per page load (refresh via BFF cookie or saved mock tokens). */
export const restoreOnce = (session: Session) => (restoring ??= session.restore().finally(() => (restoring = null)));
