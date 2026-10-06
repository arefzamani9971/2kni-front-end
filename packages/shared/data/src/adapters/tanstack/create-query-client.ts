import { QueryClient } from '@tanstack/react-query';
import { DEFAULT_FRESH_TIME_MS, shouldRetryRead } from '../../query-policy';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: DEFAULT_FRESH_TIME_MS, retry: shouldRetryRead, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
