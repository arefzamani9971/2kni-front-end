'use client';
import { useCallback, useSyncExternalStore } from 'react';
import { groupSelectionOf } from './selection-store';
import type { GroupSelection, SelectionStore } from './selection-store.types';

/** `all` / `some` / `none` of a group (the visible page or the loaded cards) for a header checkbox. */
export function useGroupSelection(store: SelectionStore, ids: readonly string[]): GroupSelection {
  const read = useCallback(() => groupSelectionOf(store, ids), [store, ids]);
  return useSyncExternalStore(store.subscribe, read, read);
}
