'use client';
import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '../../types';

/** Read or write a cached value (e.g. optimistic cart updates). */
export function useQueryCache() {
  const client = useQueryClient();
  return {
    get: <T,>(queryKey: QueryKey) => client.getQueryData<T>(queryKey),
    set: <T,>(queryKey: QueryKey, data: T) => client.setQueryData<T>(queryKey, data),
  };
}
