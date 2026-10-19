'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../../module';
import { CATALOG_STALE_TIME } from '../../common/state/catalog-stale-time';
import { entryKeys } from '../../common/state/entry-keys';

export const useBrands = () => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: entryKeys(store.id).custom('brands'),
    queryFn: ({ signal }) => catalog.brands(store.id, signal),
    staleTime: CATALOG_STALE_TIME,
  });
};
