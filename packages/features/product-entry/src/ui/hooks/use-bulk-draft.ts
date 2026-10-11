'use client';
import { useCallback } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';
import { emptyBulkDraft, type BulkDraft } from '../../domain/bulk-draft';
export function useBulkDraft(enabled = true) {
  const store = useActiveStore();
  const { bulkDrafts } = useProductEntryModule();
  const cache = useQueryCache();
  const query = useAppQuery({
    enabled,
    queryKey: ['entry-bulk', store.id],
    queryFn: async () =>
      (await bulkDrafts.get(store.id)) ??
      bulkDrafts.update(store.id, (current) => current ?? emptyBulkDraft()),
    staleTime: Infinity,
  });
  const update = useCallback(
    async (transform: (draft: BulkDraft) => BulkDraft) => {
      const next = await bulkDrafts.update(store.id, (current) => transform(current ?? emptyBulkDraft()));
      cache.set(['entry-bulk', store.id], next);
      return next;
    },
    [bulkDrafts, store.id, cache],
  );
  return { ...query, update };
}
