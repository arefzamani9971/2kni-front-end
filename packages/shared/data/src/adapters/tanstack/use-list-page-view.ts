'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListPageView, ListQuery, ListStatus } from '@dukani/domain';
import { useCallback, useEffect, useMemo } from 'react';
import { DEFAULT_FRESH_TIME_MS } from '../../query-policy';
import type { ListViewArgs } from './list-view.types';
import { asAppError } from './app-error';
import { visibleQueryData } from './visible-query-data';

const NONE: readonly never[] = [];

/**
 * Desktop view: exactly one server page. The previous page stays visible while the requested one loads, and the
 * following page is prefetched once the current one is on screen, so «next» never shows a skeleton.
 */
export function useListPageView<T, F, S extends string>({
  scope,
  query,
  readRef,
  enabled,
  active,
  prefetchNext,
  staleTime,
}: ListViewArgs<T, F, S> & { readonly prefetchNext: boolean }): ListPageView<T> {
  const client = useQueryClient();
  const q = useQuery({
    queryKey: [...scope, 'page', query.page],
    queryFn: ({ signal }) => readRef.current(query, { signal }),
    enabled: enabled && active,
    // Retain pages only inside the same resource/tenant, never across a store change.
    placeholderData: (previous, previousQuery) =>
      JSON.stringify(previousQuery?.queryKey.slice(0, -3)) === JSON.stringify(scope.slice(0, -1))
        ? previous
        : undefined,
    // An explicit `undefined` would override the client default and make the prefetched page stale on arrival.
    staleTime: staleTime ?? DEFAULT_FRESH_TIME_MS,
  });
  const error = asAppError(q.error);
  const data = visibleQueryData(q.data, error);
  const next =
    active && enabled && prefetchNext && data && !q.isPlaceholderData && data.hasNextPage ? data.page + 1 : 0;

  useEffect(() => {
    if (!next) return;
    const nextQuery: ListQuery<F, S> = { ...query, page: next };
    void client.prefetchQuery({
      queryKey: [...scope, 'page', next],
      queryFn: ({ signal }) => readRef.current(nextQuery, { signal }),
      staleTime: staleTime ?? DEFAULT_FRESH_TIME_MS,
    });
  }, [client, scope, query, next, readRef, staleTime]);

  const { refetch } = q;
  const retry = useCallback(() => void refetch(), [refetch]);
  const status: ListStatus = !active
    ? 'idle'
    : data
      ? 'ready'
      : error
        ? 'error'
        : enabled
          ? 'loading'
          : 'idle';
  return useMemo(
    () => ({
      status,
      items: data?.items ?? NONE,
      page: data?.page ?? query.page,
      pageSize: data?.pageSize ?? query.pageSize,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 0,
      isPlaceholder: q.isPlaceholderData,
      isFetching: q.isFetching,
      error,
      retry,
    }),
    [status, data, query.page, query.pageSize, q.isPlaceholderData, q.isFetching, error, retry],
  );
}
