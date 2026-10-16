'use client';
import { useCallback, useSyncExternalStore } from 'react';
import type { SelectionStore } from './selection-store.types';

/** Re-renders the caller only when this id's selection flips. */
export function useIsSelected(store: SelectionStore, id: string): boolean {
  const read = useCallback(() => store.has(id), [store, id]);
  return useSyncExternalStore(store.subscribe, read, read);
}
