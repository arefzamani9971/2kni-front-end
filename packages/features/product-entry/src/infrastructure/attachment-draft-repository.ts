import type { DraftStore } from '@dukani/platform';
import type { AttachmentDraft } from '../domain/catalog-attachment.types';
import type { AttachmentDrafts } from '../application/catalog-attachment.ports';

export function createAttachmentDrafts(store: DraftStore, userId: () => string): AttachmentDrafts {
  const key = (storeId: string) => ({
    storeId,
    userId: userId(),
    flow: 'catalog-attachments',
    id: 'current',
  });
  const queues = new Map<string, Promise<unknown>>();
  return {
    async get(storeId) {
      const value = (await store.get<AttachmentDraft>(key(storeId)))?.data ?? null;
      if (value && value.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
      return value;
    },
    update(storeId, transform) {
      const scope = key(storeId);
      const queueKey = scope.userId + ':' + storeId;
      const task = (queues.get(queueKey) ?? Promise.resolve()).then(async () => {
        const current = (await store.get<AttachmentDraft>(scope))?.data ?? null;
        if (current && current.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
        const next = transform(current);
        await store.put(scope, next);
        return next;
      });
      queues.set(
        queueKey,
        task.catch(() => undefined),
      );
      return task;
    },
  };
}
