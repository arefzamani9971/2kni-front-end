'use client';
// The only file that knows about TanStack Query.
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { isAppError, type AppError } from '@dukani/domain';
import { useCallback, useState, type ReactNode } from 'react';
import type {
  AppInfiniteQueryOptions,
  AppInfiniteQueryResult,
  AppMutationOptions,
  AppMutationResult,
  AppQueryOptions,
  AppQueryResult,
  QueryKey,
} from '../types';

const asAppError = (e: unknown): AppError | null =>
  e == null ? null : isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: String(e) };

/** Client-side errors (4xx) are final; only transient failures are retried. */
const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < 2 && isAppError(error) && (error.kind === 'Server' || error.kind === 'Unknown');

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

export function DataProvider({ children, client }: { children: ReactNode; client?: QueryClient }) {
  const [queryClient] = useState(() => client ?? createQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export function useAppQuery<TData, TSelected = TData>(options: AppQueryOptions<TData, TSelected>): AppQueryResult<TSelected> {
  const q = useQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal }) => options.queryFn({ signal }),
    enabled: options.enabled,
    staleTime: options.staleTime,
    refetchInterval: options.refetchInterval,
    select: options.select,
    placeholderData: options.placeholderData as never,
  });
  return {
    data: q.data,
    error: asAppError(q.error),
    status: q.status,
    isPending: q.isPending,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    isSuccess: q.isSuccess,
    refetch: q.refetch,
  };
}

export function useAppMutation<TData, TVariables = void>(
  options: AppMutationOptions<TData, TVariables>,
): AppMutationResult<TData, TVariables> {
  const client = useQueryClient();
  const m = useMutation<TData, AppError, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      await Promise.all((options.invalidates ?? []).map((queryKey) => client.invalidateQueries({ queryKey })));
      await options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => options.onError?.(asAppError(error)!, variables),
    onSettled: () => options.onSettled?.(),
  });
  return {
    mutate: m.mutate,
    mutateAsync: m.mutateAsync,
    data: m.data,
    error: asAppError(m.error),
    status: m.status,
    isPending: m.isPending,
    reset: m.reset,
  };
}

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

/** Invalidate (refetch) cached queries by key prefix. */
export function useInvalidate() {
  const client = useQueryClient();
  return useCallback((queryKey: QueryKey) => client.invalidateQueries({ queryKey }), [client]);
}

/** Read or write a cached value (e.g. optimistic cart updates). */
export function useQueryCache() {
  const client = useQueryClient();
  return {
    get: <T,>(queryKey: QueryKey) => client.getQueryData<T>(queryKey),
    set: <T,>(queryKey: QueryKey, data: T) => client.setQueryData<T>(queryKey, data),
  };
}
