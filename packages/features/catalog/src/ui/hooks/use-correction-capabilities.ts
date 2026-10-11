'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useCatalogModule } from '../../module';

/** What the server lets this store propose for the item, and its open request (F11 §4). Never guessed client-side. */
export function useCorrectionCapabilities(itemId: string | null | undefined) {
  const { corrections } = useCatalogModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: ['catalog', store.id, 'correction-capabilities', itemId],
    queryFn: ({ signal }) => corrections.capabilities(store.id, itemId!, signal),
    enabled: !!itemId,
  });
}
