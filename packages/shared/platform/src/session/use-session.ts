'use client';
import { useSyncExternalStore } from 'react';
import type { Session, SessionState } from './session';

const UNKNOWN: SessionState = { status: 'unknown' };

export const useSessionState = (session: Session): SessionState =>
  useSyncExternalStore(session.subscribe, session.getState, () => UNKNOWN);
