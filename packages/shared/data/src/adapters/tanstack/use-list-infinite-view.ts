'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { ListInfiniteView, ListStatus, PagedResult } from '@dukani/domain';
import { useCallback, useMemo } from 'react';
import { DEFAULT_FRESH_TIME_MS } from '../../query-policy';
import type { ListViewArgs } from './list-view.types';
import { asAppError } from './app-error';
import { visibleQueryData } from './visible-query-data';

const NONE: readonly never[] = [];

/**
 * Mobile view: the same pages appended in order (page 1, 2, 3 …) for infinite scrolling. A request already in
 * flight is never cancelled or duplicated by another «load more», and a failed next page keeps the loaded items.
 */
export function useListInfiniteView<T, F, S extends string>({
  scope,
  query,
  readRef,
  enabled,
  active,
  staleTime,
}: ListViewArgs<T, F, S>): ListInfiniteView<T> {
  const q = useInfiniteQuery({
    queryKey: [...scope, 'infinite'],
    queryFn: ({ signal, pageParam }) => readRef.current({ ...query, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (last: PagedResult<T>, pages, requestedPage) =>
      last.hasNextPage &&
      last.page === requestedPage &&
      !pages.slice(0, -1).some((page) => page.page === last.page)
        ? last.page + 1
        : undefined,
    enabled: enabled && active,
    placeholderData: (previous, previousQuery) =>
      JSON.stringify(previousQuery?.queryKey.slice(0, -2)) === JSON.stringify(scope.slice(0, -1))
        ? previous
        : undefined,
    // Same freshness as the page view: returning to the list within it does not refetch every loaded page.
    staleTime: staleTime ?? DEFAULT_FRESH_TIME_MS,
  });
  const error = asAppError(q.error);
  const data = visibleQueryData(q.data, error);
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? NONE, [data]);
  const totalCount = data?.pages.at(-1)?.totalCount ?? 0;

  const { fetchNextPage, refetch, hasNextPage, isFetching, isFetchNextPageError } = q;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) void fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage, hasNextPage, isFetching]);
  const retry = useCallback(() => {
    void (isFetchNextPageError ? fetchNextPage({ cancelRefetch: false }) : refetch());
  }, [fetchNextPage, isFetchNextPageError, refetch]);

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
      items,
      totalCount,
      hasNextPage,
      isLoadingMore: q.isFetchingNextPage,
      loadMoreError: isFetchNextPageError ? error : null,
      error: data ? null : error,
      isFetching,
      isPlaceholder: q.isPlaceholderData,
      loadMore,
      retry,
    }),
    [
      status,
      items,
      totalCount,
      hasNextPage,
      q.isFetchingNextPage,
      isFetchNextPageError,
      error,
      data,
      isFetching,
      q.isPlaceholderData,
      loadMore,
      retry,
    ],
  );
}
