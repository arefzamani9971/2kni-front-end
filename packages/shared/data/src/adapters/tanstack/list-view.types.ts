import type { ListQuery, PagedResult } from '@dukani/domain';
import type { QueryKey } from '../../types';

/** Shared inputs of the page and infinite views of `useAppList`. */
export type ListViewArgs<T, F, S extends string> = {
  /** `[...queryKey, { filter, sort, pageSize }]`; stable while the query identity is unchanged. */
  readonly scope: QueryKey;
  readonly query: ListQuery<F, S>;
  /** Latest port call; read only inside query functions, never during render. */
  readonly readRef: {
    readonly current: (query: ListQuery<F, S>, ctx: { readonly signal: AbortSignal }) => Promise<PagedResult<T>>;
  };
  readonly enabled: boolean;
  /** This view is the one the presentation shows; the other one never fetches. */
  readonly active: boolean;
  readonly staleTime?: number;
};
