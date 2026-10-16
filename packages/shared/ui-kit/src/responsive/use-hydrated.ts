'use client';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const client = () => true;
const server = () => false;

/**
 * False on the server and during hydration, true afterwards (and immediately on client-only renders). Lets a
 * facade wait for the real viewport before starting work such as a list request — the server snapshot is always
 * `mobile`, so a desktop page would otherwise fetch for the wrong presentation first.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, client, server);
}
