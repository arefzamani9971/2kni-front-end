'use client';
import {
  normalizePageSize,
  PAGE_SIZE_OPTIONS,
  paginate,
  type ListInfiniteView,
  type ListPageView,
  type ListSource,
  type SortRule,
} from '@dukani/domain';
import { useCallback, useMemo, useState } from 'react';
import { LOCAL_CHUNK } from './DataGrid.constants';
import type { LocalListOptions } from './local-list.types';
import { sortRows } from './local-sort';

const noop = () => undefined;

/**
 * A complete in-memory list (review/result tables, small reference lists, offline data) as a `DataGrid` source:
 * client-side sort and paging on desktop, progressive rendering (20 cards at a time) on mobile. Never use it for a
 * server page — a page is not the whole result (PAT-LIST-01 `local-complete`).
 */
export function useLocalList<T, S extends string = string>(
  items: readonly T[],
  options: LocalListOptions<T, S> = {},
): ListSource<T, null, S> {
  const pageSizeOptions = options.pageSizeOptions ?? PAGE_SIZE_OPTIONS;
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(() =>
    normalizePageSize(options.initialPageSize, pageSizeOptions),
  );
  const [sort, setSortState] = useState<readonly SortRule<S>[]>(options.initialSort ?? []);
  const [shown, setShown] = useState(LOCAL_CHUNK);
  const { sortValue } = options;

  const sorted = useMemo(() => sortRows(items, sort, sortValue), [items, sort, sortValue]);
  const current = useMemo(() => paginate(sorted, page, pageSize), [sorted, page, pageSize]);
  const setPage = useCallback((next: number) => setPageState(Math.max(1, Math.trunc(next) || 1)), []);
  const setPageSize = useCallback(
    (next: number) => {
      setPageSizeState(normalizePageSize(next, pageSizeOptions));
      setPageState(1);
    },
    [pageSizeOptions],
  );
  const setSort = useCallback((next: readonly SortRule<S>[]) => {
    setSortState(next);
    setPageState(1);
    setShown(LOCAL_CHUNK);
  }, []);
  const loadMore = useCallback(() => setShown((count) => count + LOCAL_CHUNK), []);

  const pageView = useMemo<ListPageView<T>>(
    () => ({
      status: 'ready',
      items: current.items,
      page: current.page,
      pageSize,
      totalCount: current.totalCount,
      totalPages: current.totalPages,
      isPlaceholder: false,
      isFetching: false,
      error: null,
      retry: noop,
    }),
    [current, pageSize],
  );
  const infiniteView = useMemo<ListInfiniteView<T>>(
    () => ({
      status: 'ready',
      items: sorted.slice(0, shown),
      totalCount: sorted.length,
      hasNextPage: shown < sorted.length,
      isLoadingMore: false,
      loadMoreError: null,
      error: null,
      isFetching: false,
      isPlaceholder: false,
      loadMore,
      retry: noop,
    }),
    [sorted, shown, loadMore],
  );
  const query = useMemo(() => ({ page, pageSize, sort, filter: null }), [page, pageSize, sort]);
  return useMemo(
    () => ({
      query,
      pageSizeOptions,
      setPage,
      setPageSize,
      setSort,
      applyFilter: noop,
      present: noop,
      pageView,
      infiniteView,
      refresh: noop,
    }),
    [query, pageSizeOptions, setPage, setPageSize, setSort, pageView, infiniteView],
  );
}
