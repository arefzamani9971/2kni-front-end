'use client';
import { useSyncExternalStore } from 'react';
import type { SelectionStore } from './selection-store.types';

/** Number of selected ids; re-renders only when the number changes. */
export function useSelectionCount(store: SelectionStore): number {
  return useSyncExternalStore(store.subscribe, store.size, store.size);
}
