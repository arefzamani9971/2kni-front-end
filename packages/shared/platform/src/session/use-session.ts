'use client';
import { useSyncExternalStore } from 'react';
import type { Session, SessionState } from './session.types';
import { UNKNOWN } from './use-session.constants';

export const useSessionState = (session: Session): SessionState =>
  useSyncExternalStore(session.subscribe, session.getState, () => UNKNOWN);

/** Data scopes change for a new login, including a re-login by the same user. */
export const useSessionVersion = (session: Session): number =>
  useSyncExternalStore(session.subscribe, session.getSessionVersion, () => 0);
