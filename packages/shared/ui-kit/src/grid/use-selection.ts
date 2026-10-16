'use client';
import { useState } from 'react';
import { createSelectionStore } from './selection-store';
import type { SelectionStore } from './selection-store.types';

/**
 * One selection per screen, created once and stable for its lifetime. Pass it to `DataGrid`; read it in bulk
 * actions with `selection.ids()` or reactively with `useSelectionCount` / `useSelectedIds`.
 */
export function useSelection(initial?: Iterable<string>): SelectionStore {
  const [store] = useState(() => createSelectionStore(initial));
  return store;
}
