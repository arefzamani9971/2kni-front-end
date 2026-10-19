'use client';
import { useCallback, useState } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { EMPTY_SELECTION } from '../../../domain/entry-selection.constants';
import type { EntrySelection } from '../../../domain/entry-selection.types';
import { useProductEntryModule } from '../../../module';

/**
 * The store's own name and note typed for a catalog item before the entry starts (local draft, per store and user).
 * It is read once; every accepted write also replaces the cached copy, so coming back to the same item shows what
 * was saved last. `save` resolves false when the write failed (the form autosave tries again on its next flush).
 */
export function useSelectionDraft(itemId: string | undefined) {
  const store = useActiveStore();
  const { selections } = useProductEntryModule();
  const cache = useQueryCache();
  const [failed, setFailed] = useState(false);
  const draft = useAppQuery({
    queryKey: ['entry-selection-editor', store.id, itemId],
    enabled: !!itemId,
    queryFn: async () => (await selections.read(store.id, itemId!)) ?? EMPTY_SELECTION,
    staleTime: Infinity,
  });
  const save = useCallback(
    async (value: EntrySelection) => {
      if (!itemId) return false;
      try {
        await selections.write(store.id, itemId, value);
      } catch {
        setFailed(true);
        return false;
      }
      cache.set(['entry-selection-editor', store.id, itemId], value);
      setFailed(false);
      return true;
    },
    [selections, cache, store.id, itemId],
  );
  return {
    initial: draft.data,
    error: draft.error,
    retry: () => void draft.refetch(),
    save,
    failed,
  };
}
