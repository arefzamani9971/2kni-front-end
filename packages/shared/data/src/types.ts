import type { AppError } from '@dukani/domain';

/**
 * Application-owned server-state contract. Familiar query states are preserved, but adapter
 * objects and refresh results must not escape. Replacing an adapter still requires behavioral tests.
 */
export type QueryKey = readonly unknown[];

declare const dataClientBrand: unique symbol;
/** Opaque provider handle; cache operations are exposed through useQueryCache/useInvalidate. */
export type DataClient = { readonly [dataClientBrand]: true };

/** A refresh reports its own outcome; cached data may still exist after a failed refresh. */
export type QueryRefreshResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: AppError };

export type QueryCache = {
  readonly get: <T>(key: QueryKey) => T | undefined;
  readonly set: <T>(key: QueryKey, data: T) => void;
  readonly subscribe: (key: QueryKey, listener: () => void) => () => void;
};

export type QueryStatus = 'pending' | 'error' | 'success';

export type AppQueryOptions<TData, TSelected = TData> = {
  readonly queryKey: QueryKey;
  readonly queryFn: (ctx: { signal: AbortSignal }) => Promise<TData>;
  readonly enabled?: boolean;
  /** Default `READ_FRESH_TIME_MS` (0): revalidate on mount, showing the cached value meanwhile. */
  readonly staleTime?: number;
  readonly refetchInterval?: number | false;
  readonly select?: (data: TData) => TSelected;
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
  readonly refetch: () => Promise<QueryRefreshResult<TData>>;
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
