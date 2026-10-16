import type { GroupSelection, SelectionStore } from './selection-store.types';

/** Copy-on-write id set with change notification; `ids()` is stable between changes. */
export function createSelectionStore(initial: Iterable<string> = []): SelectionStore {
  let selected: ReadonlySet<string> = new Set(initial);
  const listeners = new Set<() => void>();
  const commit = (next: Set<string>) => {
    selected = next;
    listeners.forEach((listener) => listener());
  };
  const setMany = (ids: readonly string[], value: boolean) => {
    const changed = ids.filter((id) => selected.has(id) !== value);
    if (!changed.length) return;
    const next = new Set(selected);
    changed.forEach((id) => (value ? next.add(id) : next.delete(id)));
    commit(next);
  };
  return {
    has: (id) => selected.has(id),
    size: () => selected.size,
    ids: () => selected,
    set: (id, value) => setMany([id], value),
    toggle: (id) => setMany([id], !selected.has(id)),
    setMany,
    clear: () => {
      if (selected.size) commit(new Set());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

/** `all` when every id is selected, `some` when at least one is, `none` otherwise (also for an empty group). */
export function groupSelectionOf(store: SelectionStore, ids: readonly string[]): GroupSelection {
  let count = 0;
  for (const id of ids) if (store.has(id)) count++;
  return count === 0 ? 'none' : count === ids.length ? 'all' : 'some';
}
