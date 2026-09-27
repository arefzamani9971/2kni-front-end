'use client';
import { useSessionState, useNavigation, type Session, type SessionState } from '@dukani/platform';
import { useEffect, type ReactNode } from 'react';

let restoring: Promise<SessionState> | null = null;

/** Restores the session once per page load (refresh via BFF cookie or saved mock tokens). */
export const restoreOnce = (session: Session) => (restoring ??= session.restore().finally(() => (restoring = null)));

/**
 * Guards signed-in areas: restores the session, then either renders children or replaces the route
 * with the login page (keeping `next`). Anonymous areas use `redirectSignedInTo` instead.
 */
export function SessionGate({
  session,
  loginHref,
  fallback = null,
  children,
}: {
  session: Session;
  loginHref: (next: string) => string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const state = useSessionState(session);
  const nav = useNavigation();
  useEffect(() => {
    if (state.status === 'unknown') void restoreOnce(session);
    if (state.status === 'signed-out') nav.replace(loginHref(window.location.pathname + window.location.search));
  }, [state.status, session, nav, loginHref]);
  return <>{state.status === 'signed-in' ? children : fallback}</>;
}
