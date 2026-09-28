'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';
import { CATALOG_STALE_TIME } from './catalog-stale-time';
import { entryKeys } from './entry-keys';

export const useProductType = (productTypeId: string) => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: entryKeys(store.id).custom('type', productTypeId),
    queryFn: ({ signal }) => catalog.productType(store.id, productTypeId, signal),
    enabled: !!productTypeId,
    staleTime: CATALOG_STALE_TIME,
  });
};
