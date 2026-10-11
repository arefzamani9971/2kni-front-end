'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useCatalogModule } from '../../module';

/** One correction request with its history; reloads keep the status visible (F11 AC05). */
export function useCorrection(correctionId: string) {
  const { corrections } = useCatalogModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: ['catalog', store.id, 'correction', correctionId],
    queryFn: ({ signal }) => corrections.get(store.id, correctionId, signal),
  });
}
