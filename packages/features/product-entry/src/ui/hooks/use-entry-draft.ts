'use client';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useCallback } from 'react';
import type { EntryDraft } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './entry-keys';

/** Loads a wizard draft and saves changes to IndexedDB + the query cache. */
export function useEntryDraft(draftId: string) {
  const { drafts } = useProductEntryModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const key = entryKeys(store.id).custom('draft', draftId);
  const q = useAppQuery({ queryKey: key, queryFn: () => drafts.get(store.id, draftId), staleTime: Infinity });
  const save = useCallback(
    async (update: (d: EntryDraft) => EntryDraft) => {
      const current = cache.get<EntryDraft | null>(key) ?? (await drafts.get(store.id, draftId));
      if (!current) return null;
      const next = await drafts.save(store.id, update(current));
      cache.set(key, next);
      return next;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key is derived from these ids
    [drafts, store.id, draftId, cache],
  );
  return { draft: q.data ?? null, loading: q.isPending, missing: q.isSuccess && !q.data, save };
}
