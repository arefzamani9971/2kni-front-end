import type { DraftStore } from '@dukani/platform';
import type { BulkDraft } from '../domain/bulk-draft';
export function createBulkDrafts(store: DraftStore, userId: () => string) {
  const key = (storeId: string) => ({ storeId, userId: userId(), flow: 'entry-bulk', id: 'current' });
  const queues = new Map<string, Promise<unknown>>();
  return {
    async get(storeId: string): Promise<BulkDraft | null> {
      const value = (await store.get<BulkDraft>(key(storeId)))?.data ?? null;
      if (value && value.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
      return value;
    },
    update(storeId: string, transform: (draft: BulkDraft | null) => BulkDraft): Promise<BulkDraft> {
      const scope = key(storeId);
      const queueKey = scope.userId + ':' + storeId;
      const task = (queues.get(queueKey) ?? Promise.resolve()).then(async () => {
        const current = (await store.get<BulkDraft>(scope))?.data ?? null;
        if (current && current.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
        const next = { ...transform(current), updatedAt: new Date().toISOString() };
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
