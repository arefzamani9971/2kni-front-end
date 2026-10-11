'use client';
import { useQuery } from '@tanstack/react-query';
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
    staleTime: options.staleTime,
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
