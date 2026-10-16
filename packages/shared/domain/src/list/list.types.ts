import type { AppError } from '../app-error.types';

/*
 * Page-based list contract (documents/spec/patterns/list-query-contract.md, PAT-LIST-01).
 * These are pure shapes shared by the data facade (`useAppList`) and the presentation (`DataGrid`), so neither
 * package depends on the other.
 */

export type SortDirection = 'asc' | 'desc';

export type SortRule<S extends string = string> = {
  readonly field: S;
  readonly direction: SortDirection;
};

/** One request: 1-based page, page size, ordered sort rules and the resource's own typed filter object. */
export type ListQuery<F = unknown, S extends string = string> = {
  readonly page: number;
  readonly pageSize: number;
  readonly sort: readonly SortRule<S>[];
  readonly filter: F;
};

/** Server envelope; `page` is the effective page after the server clamps an out-of-range request. */
export type PagedResult<T> = {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
};

/** Desktop shows one page at a time; mobile appends consecutive pages. Chosen by the presentation, never by features. */
export type ListPresentation = 'pages' | 'infinite';

/** `idle` = not requested yet (no presentation reported), `loading` = first data on its way. */
export type ListStatus = 'idle' | 'loading' | 'ready' | 'error';

export type ListPageView<T> = {
  readonly status: ListStatus;
  readonly items: readonly T[];
  /** Page actually shown (the server may clamp the requested one). */
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  /** The previous page stays visible while the requested one loads (no skeleton flash between pages). */
  readonly isPlaceholder: boolean;
  readonly isFetching: boolean;
  readonly error: AppError | null;
  readonly retry: () => void;
};

export type ListInfiniteView<T> = {
  readonly status: ListStatus;
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly hasNextPage: boolean;
  readonly isLoadingMore: boolean;
  /** A failed next page keeps every loaded item; only the end of the list shows the error. */
  readonly loadMoreError: AppError | null;
  /** First-page failure. */
  readonly error: AppError | null;
  readonly isFetching: boolean;
  /** Items of the previous filter stay visible (dimmed) until the first page of the new one arrives. */
  readonly isPlaceholder: boolean;
  readonly loadMore: () => void;
  readonly retry: () => void;
};

/**
 * Everything a list presentation needs. Query state lives here, above the viewport strategies, so switching
 * desktop ↔ mobile keeps filter, sort and page size.
 */
export type ListSource<T, F = unknown, S extends string = string> = {
  readonly query: ListQuery<F, S>;
  readonly pageSizeOptions: readonly number[];
  readonly setPage: (page: number) => void;
  readonly setPageSize: (pageSize: number) => void;
  readonly setSort: (sort: readonly SortRule<S>[]) => void;
  /** Applies a complete filter and returns to page 1. */
  readonly applyFilter: (filter: F) => void;
  /** Reported by the presentation once it knows the viewport; nothing is fetched before. */
  readonly present: (presentation: ListPresentation) => void;
  readonly pageView: ListPageView<T>;
  readonly infiniteView: ListInfiniteView<T>;
  readonly refresh: () => void;
};

/** One entry of a numbered pager: a page number or a gap. */
export type PagerItem = { readonly kind: 'page'; readonly page: number } | { readonly kind: 'gap'; readonly key: string };

/** 1-based positions of the first and last item on a page; both 0 when there is nothing. */
export type ItemRange = { readonly from: number; readonly to: number };
