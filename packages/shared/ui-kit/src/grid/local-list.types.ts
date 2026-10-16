import type { SortRule } from '@dukani/domain';

/** Options of `useLocalList` (profile `local-complete`: the whole list is already in memory). */
export type LocalListOptions<T, S extends string> = {
  /** Value a sortable column compares by (module-level function); without it the order never changes. */
  readonly sortValue?: (row: T, field: S) => string | number | null | undefined;
  readonly initialSort?: readonly SortRule<S>[];
  readonly initialPageSize?: number;
  readonly pageSizeOptions?: readonly number[];
};
