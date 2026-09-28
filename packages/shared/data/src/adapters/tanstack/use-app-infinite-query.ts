'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AppInfiniteQueryOptions, AppInfiniteQueryResult } from '../../types';
import { asAppError } from './app-error';

export function useAppInfiniteQuery<T>(options: AppInfiniteQueryOptions<T>): AppInfiniteQueryResult<T> {
  const q = useInfiniteQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal, pageParam }) => options.queryFn({ signal, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: options.enabled,
  });
  return {
    items: q.data?.pages.flatMap((p) => p.items) ?? [],
    error: asAppError(q.error),
    status: q.status,
    isPending: q.isPending,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    isSuccess: q.isSuccess,
    refetch: q.refetch,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    fetchNextPage: () => void q.fetchNextPage(),
  };
}
