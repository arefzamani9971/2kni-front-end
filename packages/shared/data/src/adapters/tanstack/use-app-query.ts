'use client';
import { useQuery } from '@tanstack/react-query';
import { READ_FRESH_TIME_MS } from '../../query-policy';
import type { AppQueryOptions, AppQueryResult } from '../../types';
import { asAppError } from './app-error';
import { refreshResult } from './refresh-result';
import { visibleQueryData } from './visible-query-data';

export function useAppQuery<TData, TSelected = TData>(
  options: AppQueryOptions<TData, TSelected>,
): AppQueryResult<TSelected> {
  const q = useQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal }) => options.queryFn({ signal }),
    enabled: options.enabled,
    // explicit: `undefined` would silently override the client default instead of choosing a policy
    staleTime: options.staleTime ?? READ_FRESH_TIME_MS,
    refetchInterval: options.refetchInterval,
    select: options.select,
  });
  return {
    data: visibleQueryData(q.data, asAppError(q.error)),
    error: asAppError(q.error),
    status: q.status,
    isPending: q.isPending,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    isSuccess: q.isSuccess,
    refetch: async () => refreshResult(await q.refetch()),
  };
}
