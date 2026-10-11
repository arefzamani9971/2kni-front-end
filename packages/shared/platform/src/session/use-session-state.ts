'use client';
import { useSyncExternalStore } from 'react';
import type { Session, SessionState } from './session.types';
import { UNKNOWN } from './use-session-state.constants';

/** The session's auth state; UNKNOWN on the server until the client store is read. */
export const useSessionState = (session: Session): SessionState =>
  useSyncExternalStore(session.subscribe, session.getState, () => UNKNOWN);
