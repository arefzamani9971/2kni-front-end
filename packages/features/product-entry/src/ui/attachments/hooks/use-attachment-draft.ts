'use client';
import { useCallback, useRef, useState } from 'react';
import { useAppQuery, useInvalidate, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../../module';
import { emptyAttachmentDraft } from '../../../domain/catalog-attachment';
import type { AttachmentDraft } from '../../../domain/catalog-attachment.types';
import { previewAttachments, submitAttachments } from '../../../application/catalog-attachment-workflow';
import { appError, isAppError, type AppError } from '@dukani/domain';

export function useAttachmentDraft() {
  const { id: storeId } = useActiveStore();
  const { attachmentDrafts, attachments } = useProductEntryModule();
  const cache = useQueryCache();
  const invalidate = useInvalidate();
  const [error, setError] = useState<AppError>();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const query = useAppQuery({
    queryKey: ['catalog-attachments-draft', storeId],
    queryFn: async () => (await attachmentDrafts.get(storeId)) ?? emptyAttachmentDraft(),
    staleTime: Infinity,
  });
  const update = useCallback(
    async (transform: (draft: AttachmentDraft) => AttachmentDraft) => {
      const visible = cache.get<AttachmentDraft>(['catalog-attachments-draft', storeId]);
      const next = await attachmentDrafts.update(storeId, (current) =>
        transform(visible ?? current ?? emptyAttachmentDraft()),
      );
      cache.set(['catalog-attachments-draft', storeId], next);
      return next;
    },
    [attachmentDrafts, cache, storeId],
  );
  const run = useCallback(async (task: () => Promise<unknown>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await task();
    } catch (caught) {
      setError(isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', 'Unexpected error'));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }, []);
  const edit = useCallback(
    (transform: (current: AttachmentDraft) => AttachmentDraft) => {
      if (lock.current) return;
      try {
        const current = cache.get<AttachmentDraft>(['catalog-attachments-draft', storeId]);
        if (!current) return;
        const next = transform(current);
        cache.set(['catalog-attachments-draft', storeId], next);
        setError(undefined);
        // Publish immediately; ordered durable writes must never publish stale snapshots back to UI.
        void attachmentDrafts
          .update(storeId, () => next)
          .catch((caught) =>
            setError(isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', 'Unexpected error')),
          );
      } catch (caught) {
        setError(isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', 'Unexpected error'));
      }
    },
    [attachmentDrafts, cache, storeId],
  );
  const draft = query.data;
  return {
    ...query,
    error: error ?? query.error,
    busy,
    update,
    run,
    edit,
    review: () =>
      run(async () => {
        if (draft)
          await update((current) => current)
            .then((latest) => previewAttachments(attachments, storeId, latest))
            .then((next) => update(() => next));
      }),
    submit: () =>
      run(async () => {
        if (!draft) return;
        let changed = false;
        try {
          await submitAttachments(attachments, storeId, draft, async (next) => {
            await update(() => next);
            changed ||= next.chunks.some((chunk) =>
              chunk.result?.results.some((row) => row.status === 'Added'),
            );
          });
        } finally {
          // One refresh per attempt, also after a partially committed attempt fails.
          if (changed)
            await Promise.all([
              invalidate(['catalog', storeId]),
              invalidate(['products', storeId]),
              invalidate(['catalog-attachment-candidates', storeId]),
            ]);
        }
      }),
  };
}
