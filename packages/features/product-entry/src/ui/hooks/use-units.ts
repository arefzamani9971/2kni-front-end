'use client';
import { useAppQuery } from '@dukani/data';
import { useProductEntryModule } from '../../module';
import { CATALOG_STALE_TIME } from '../common/state/catalog-stale-time';
export function useUnits() {
  const { catalog } = useProductEntryModule();
  return useAppQuery({
    queryKey: ['reference', 'units'],
    queryFn: ({ signal }) => catalog.units(signal),
    staleTime: CATALOG_STALE_TIME,
  });
}
