'use client';
import { useSessionState, useNavigation, type Session } from '@dukani/platform';
import { useEffect, useState, type ReactNode } from 'react';
import { restoreOnce } from './restore-once';

/**
 * Guards signed-in areas: restores the session, then either renders children or replaces the route
 * with the login page (keeping `next`). Anonymous areas use `redirectSignedInTo` instead.
 */
export function SessionGate({
  session,
  loginHref,
  fallback = null,
  restoreError,
  children,
}: {
  session: Session;
  loginHref: (next: string) => string;
  fallback?: ReactNode;
  restoreError: (retry: () => void) => ReactNode;
  children: ReactNode;
}) {
  const state = useSessionState(session);
  const nav = useNavigation();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (state.status === 'unknown')
      void restoreOnce(session).catch(() => {
        if (active) setFailed(true);
      });
    if (state.status === 'signed-out')
      nav.replace(loginHref(window.location.pathname + window.location.search));
    return () => {
      active = false;
    };
  }, [state.status, session, nav, loginHref, attempt]);
  if (state.status === 'unknown' && failed)
    return (
      <>
        {restoreError(() => {
          setFailed(false);
          setAttempt((n) => n + 1);
        })}
      </>
    );
  return <>{state.status === 'signed-in' ? children : fallback}</>;
}
