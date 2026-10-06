'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { QueryCache } from '../../types';

/** Read or write a cached value (e.g. optimistic cart updates). */
export function useQueryCache(): QueryCache {
  const client = useQueryClient();
  return useMemo<QueryCache>(
    () => ({
      get: (queryKey) => client.getQueryData(queryKey),
      set: (queryKey, data) => {
        client.setQueryData(queryKey, data);
      },
    }),
    [client],
  );
}
