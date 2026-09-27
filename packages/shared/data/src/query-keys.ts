import type { QueryKey } from './types';

/**
 * Query-key factory convention: `[scope, storeId?, entity, …params]`.
 * `keys('products', storeId).list({ q })` → `['products', storeId, 'list', { q }]`.
 */
export const createQueryKeys = <const S extends string>(scope: S) => (storeId?: string) => {
  const base = storeId ? ([scope, storeId] as const) : ([scope] as const);
  return {
    all: base as QueryKey,
    list: (params?: unknown): QueryKey => [...base, 'list', params ?? {}],
    detail: (id: string): QueryKey => [...base, 'detail', id],
    custom: (...parts: unknown[]): QueryKey => [...base, ...parts],
  };
};
