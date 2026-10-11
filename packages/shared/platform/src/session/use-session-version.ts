'use client';
import { useSyncExternalStore } from 'react';
import type { Session } from './session.types';

/** Data scopes change for a new login, including a re-login by the same user. */
export const useSessionVersion = (session: Session): number =>
  useSyncExternalStore(session.subscribe, session.getSessionVersion, () => 0);
