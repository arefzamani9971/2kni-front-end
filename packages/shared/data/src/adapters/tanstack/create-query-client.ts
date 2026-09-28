import { QueryClient } from '@tanstack/react-query';
import { isAppError } from '@dukani/domain';

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
