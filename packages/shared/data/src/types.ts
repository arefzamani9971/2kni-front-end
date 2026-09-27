import type { AppError } from '@dukani/domain';

/**
 * Server-state facade. The shapes intentionally mirror TanStack Query so the syntax stays familiar,
 * but features depend only on these types; replacing the library touches `src/adapters` only.
 */
export type QueryKey = readonly unknown[];

export type QueryStatus = 'pending' | 'error' | 'success';

export type AppQueryOptions<TData, TSelected = TData> = {
  readonly queryKey: QueryKey;
  readonly queryFn: (ctx: { signal: AbortSignal }) => Promise<TData>;
  readonly enabled?: boolean;
  readonly staleTime?: number;
  readonly refetchInterval?: number | false;
  readonly select?: (data: TData) => TSelected;
  readonly placeholderData?: TData;
};

export type AppQueryResult<TData> = {
  readonly data: TData | undefined;
  readonly error: AppError | null;
  readonly status: QueryStatus;
  readonly isPending: boolean;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
  readonly isError: boolean;
  readonly isSuccess: boolean;
  readonly refetch: () => Promise<unknown>;
};

export type AppMutationOptions<TData, TVariables> = {
  readonly mutationFn: (variables: TVariables) => Promise<TData>;
  readonly onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  readonly onError?: (error: AppError, variables: TVariables) => void;
  readonly onSettled?: () => void;
  /** Query keys to invalidate after success. */
  readonly invalidates?: readonly QueryKey[];
};

export type AppMutationResult<TData, TVariables> = {
  readonly mutate: (variables: TVariables) => void;
  readonly mutateAsync: (variables: TVariables) => Promise<TData>;
  readonly data: TData | undefined;
  readonly error: AppError | null;
  readonly status: 'idle' | 'pending' | 'error' | 'success';
  readonly isPending: boolean;
  readonly reset: () => void;
};

export type Page<T> = { readonly items: readonly T[]; readonly nextCursor?: string | null };

export type AppInfiniteQueryOptions<T> = {
  readonly queryKey: QueryKey;
  readonly queryFn: (ctx: { signal: AbortSignal; cursor: string | null }) => Promise<Page<T>>;
  readonly enabled?: boolean;
};

export type AppInfiniteQueryResult<T> = Omit<AppQueryResult<readonly T[]>, 'data'> & {
  readonly items: readonly T[];
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => void;
};
