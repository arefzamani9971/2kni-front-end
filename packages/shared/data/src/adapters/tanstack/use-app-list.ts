'use client';
import {
  PAGE_SIZE_OPTIONS,
  type ListPresentation,
  type ListQuery,
  type ListSource,
  type SortRule,
} from '@dukani/domain';
import { useCallback, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { initialListState, listReducer } from '../../list-reducer';
import type { AppListOptions } from '../../list.types';
import { useListInfiniteView } from './use-list-infinite-view';
import { useListPageView } from './use-list-page-view';

/**
 * One remote list for every viewport (PAT-LIST-02). Query state (filter, sort, page size, page) lives here, above
 * the presentation, so a desktop ↔ mobile switch keeps it. Nothing is fetched until a presentation is known: the
 * `DataGrid` reports `pages` (desktop grid + pager) or `infinite` (mobile cards) after hydration, which also keeps
 * a desktop page from fetching twice while React hydrates the mobile snapshot.
 *
 * ```tsx
 * const products = useAppList({
 *   queryKey: keys('products', storeId).custom('list'),
 *   read: (query, { signal }) => module.products.list(storeId, query, signal),
 *   initialFilter: { q: '' },
 * });
 * <DataGrid source={products} columns={columns} getRowId={(p) => p.id} label={t('title')} />
 * ```
 */
export function useAppList<T, F, S extends string = string>(options: AppListOptions<T, F, S>): ListSource<T, F, S> {
  const [state, dispatch] = useReducer(listReducer<F, S>, options, initialListState<T, F, S>);
  const pageSizeOptions = options.pageSizeOptions ?? PAGE_SIZE_OPTIONS;
  const presentation = options.presentation ?? state.presentation;
  const enabled = options.enabled ?? true;

  const readRef = useRef(options.read);
  useLayoutEffect(() => {
    readRef.current = options.read;
  });

  const { page, pageSize, sort, filter } = state;
  const query = useMemo<ListQuery<F, S>>(() => ({ page, pageSize, sort, filter }), [page, pageSize, sort, filter]);
  const keyHash = JSON.stringify(options.queryKey);
  const scope = useMemo(
    () => [...(JSON.parse(keyHash) as unknown[]), { filter, sort, pageSize }],
    [keyHash, filter, sort, pageSize],
  );
  const shared = { scope, query, readRef, enabled, staleTime: options.staleTime };
  const pageView = useListPageView<T, F, S>({
    ...shared,
    active: presentation === 'pages',
    prefetchNext: options.prefetchNext ?? true,
  });
  const infiniteView = useListInfiniteView<T, F, S>({ ...shared, active: presentation === 'infinite' });

  const setPage = useCallback((next: number) => dispatch({ type: 'page', page: next }), []);
  const setPageSize = useCallback(
    (next: number) => dispatch({ type: 'pageSize', pageSize: next, options: pageSizeOptions }),
    [pageSizeOptions],
  );
  const setSort = useCallback((next: readonly SortRule<S>[]) => dispatch({ type: 'sort', sort: next }), []);
  const applyFilter = useCallback((next: F) => dispatch({ type: 'filter', filter: next }), []);
  const present = useCallback((next: ListPresentation) => dispatch({ type: 'present', presentation: next }), []);
  const { retry: retryPage } = pageView;
  const { retry: retryInfinite } = infiniteView;
  const refresh = useCallback(() => {
    if (presentation === 'pages') retryPage();
    if (presentation === 'infinite') retryInfinite();
  }, [presentation, retryPage, retryInfinite]);

  return useMemo(
    () => ({
      query,
      pageSizeOptions,
      setPage,
      setPageSize,
      setSort,
      applyFilter,
      present,
      pageView,
      infiniteView,
      refresh,
    }),
    [query, pageSizeOptions, setPage, setPageSize, setSort, applyFilter, present, pageView, infiniteView, refresh],
  );
}
