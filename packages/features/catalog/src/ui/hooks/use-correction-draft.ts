'use client';
import { useCallback } from 'react';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { emptyCorrectionDraft } from '../../domain/correction';
import type { CorrectionDraft } from '../../domain/correction.types';
import { useCatalogModule } from '../../module';

/** The saved correction form of one item, scoped to user and store (draft key `correction:{itemId}`). */
export function useCorrectionDraft(itemId: string) {
  const { editors } = useCatalogModule();
  const store = useActiveStore();
  const id = `correction:${itemId}`;
  const saved = useAppQuery({
    queryKey: ['catalog-correction-draft', store.id, itemId],
    queryFn: () => editors.read<CorrectionDraft>(store.id, id),
    staleTime: Infinity,
  });
  const write = useCallback(
    (draft: CorrectionDraft) => editors.write(store.id, id, draft),
    [editors, store.id, id],
  );
  const clear = useCallback(() => editors.remove(store.id, id), [editors, store.id, id]);
  return {
    loading: saved.isPending,
    error: saved.error,
    retry: saved.refetch,
    initial: saved.data ?? emptyCorrectionDraft,
    write,
    clear,
  };
}
