'use client';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { Save } from '../common/types/use-entry-draft.types';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './entry-keys';
import { toRegisterRequest } from '../../domain/entry-draft';

/** Loads a wizard draft and saves changes to IndexedDB + the query cache. */
export function useEntryDraft(draftId: string) {
  const { drafts, analytics } = useProductEntryModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const key = entryKeys(store.id).custom('draft', draftId);
  const q = useAppQuery({ queryKey: key, queryFn: () => drafts.get(store.id, draftId), staleTime: Infinity });
  const saves = useRef<Promise<unknown>>(Promise.resolve());
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const save = useCallback<Save>(
    (update: (d: EntryDraft) => EntryDraft) => {
      const task = saves.current.then(async () => {
        if (!active.current) return null;
        const current = cache.get<EntryDraft | null>(key) ?? (await drafts.get(store.id, draftId));
        if (!current || !active.current) return null;
        const candidate = update(current);
        if (
          current.pending &&
          !candidate.result &&
          JSON.stringify(toRegisterRequest(candidate)) !== JSON.stringify(current.pending.body)
        )
          throw new Error('ENTRY_RESULT_UNKNOWN');
        const next = await drafts.save(store.id, candidate);
        if (!active.current) return next;
        cache.set(key, next);
        analytics.track({ eventName: 'draft_saved', flowId: 'F10' });
        return next;
      });
      saves.current = task.catch(() => undefined);
      return task;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key is derived from these ids
    [drafts, analytics, store.id, draftId, cache],
  );
  return {
    draft: q.data ?? null,
    loading: q.isPending,
    error: q.error,
    missing: q.isSuccess && !q.data,
    save,
  };
}
