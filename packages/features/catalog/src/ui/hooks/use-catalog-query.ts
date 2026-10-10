'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useCatalogModule } from '../../module';
import type { CatalogPort } from '../../application/catalog-port.types';
export function useCatalogQuery<T>(
  key: readonly string[],
  load: (port: CatalogPort, storeId: string, signal: AbortSignal) => Promise<T>,
  enabled = true,
) {
  const { catalog } = useCatalogModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: ['catalog', store.id, ...key],
    queryFn: ({ signal }) => load(catalog, store.id, signal),
    enabled,
    staleTime: 60_000,
  });
}
