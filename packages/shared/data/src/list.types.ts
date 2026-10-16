import type { ListPresentation, ListQuery, PagedResult, SortRule } from '@dukani/domain';
import type { QueryKey } from './types';

/** Options of `useAppList`: one remote, page-based list (PAT-LIST-01, profile `remote-page`). */
export type AppListOptions<T, F, S extends string> = {
  /** Cache scope, e.g. `keys('products', storeId).custom('list')`; filter, sort, size and page are appended. */
  readonly queryKey: QueryKey;
  /** Port call. The adapter maps `ListQuery` to OpenAPI parameters and the response to `PagedResult`. */
  readonly read: (query: ListQuery<F, S>, ctx: { readonly signal: AbortSignal }) => Promise<PagedResult<T>>;
  readonly initialFilter: F;
  readonly initialSort?: readonly SortRule<S>[];
  readonly initialPageSize?: number;
  readonly initialPage?: number;
  /** Offered by the desktop pager; defaults to 10/20/50/100. */
  readonly pageSizeOptions?: readonly number[];
  readonly enabled?: boolean;
  /**
   * Fixes the presentation for a custom (level-2) layout that does not use `DataGrid`. Leave it out when a
   * `DataGrid` renders the list: the grid reports `pages` (desktop) or `infinite` (mobile) after hydration.
   */
  readonly presentation?: ListPresentation;
  /** Loads the next desktop page in the background so «next» is instant (default true). */
  readonly prefetchNext?: boolean;
  readonly staleTime?: number;
};

export type ListState<F, S extends string> = {
  readonly page: number;
  readonly pageSize: number;
  readonly sort: readonly SortRule<S>[];
  readonly filter: F;
  readonly presentation: ListPresentation | null;
};

export type ListAction<F, S extends string> =
  | { readonly type: 'page'; readonly page: number }
  | { readonly type: 'pageSize'; readonly pageSize: number; readonly options: readonly number[] }
  | { readonly type: 'sort'; readonly sort: readonly SortRule<S>[] }
  | { readonly type: 'filter'; readonly filter: F }
  | { readonly type: 'present'; readonly presentation: ListPresentation };
