import { isAppError } from '@dukani/domain';

/** At most two read retries; auth/business/offline/bug errors require caller or user action. */
export const shouldRetryRead = (failureCount: number, error: unknown): boolean =>
  failureCount < 2 && isAppError(error) && (error.kind === 'Server' || error.kind === 'Unknown');

export const DEFAULT_FRESH_TIME_MS = 30_000;
