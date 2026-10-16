'use client';
import { useSyncExternalStore } from 'react';
import type { SelectionStore } from './selection-store.types';

/** The selected ids as an immutable set (same object until the selection changes), e.g. for a bulk command. */
export function useSelectedIds(store: SelectionStore): ReadonlySet<string> {
  return useSyncExternalStore(store.subscribe, store.ids, store.ids);
}
