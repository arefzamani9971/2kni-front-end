'use client';
import { useSyncExternalStore } from 'react';
import type { Session, SessionState } from './session.types';
import { UNKNOWN } from './use-session.constants';

export const useSessionState = (session: Session): SessionState =>
  useSyncExternalStore(session.subscribe, session.getState, () => UNKNOWN);
