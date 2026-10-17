import { isAppError } from '@dukani/domain';

/** At most two read retries; auth/business/offline/bug errors require caller or user action. */
export const shouldRetryRead = (failureCount: number, error: unknown): boolean =>
  failureCount < 2 && isAppError(error) && (error.kind === 'Server' || error.kind === 'Unknown');

/** Lists, prefetched pages and other reads that have explicit invalidation scopes stay fresh this long. */
export const DEFAULT_FRESH_TIME_MS = 30_000;

/**
 * A screen read (`useAppQuery` without `staleTime`) revalidates whenever it mounts; the cached value stays on
 * screen meanwhile, so there is no spinner. Several reads depend on commands that do not invalidate them (barcode
 * lookup after a registration or alias, scan settings, store join status), so a longer default would show stale
 * data there. A read that is safe to reuse states its own `staleTime` (reference data, reports, catalog queries).
 */
export const READ_FRESH_TIME_MS = 0;
