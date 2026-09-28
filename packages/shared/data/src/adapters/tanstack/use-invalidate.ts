'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { QueryKey } from '../../types';

/** Invalidate (refetch) cached queries by key prefix. */
export function useInvalidate() {
  const client = useQueryClient();
  return useCallback((queryKey: QueryKey) => client.invalidateQueries({ queryKey }), [client]);
}
