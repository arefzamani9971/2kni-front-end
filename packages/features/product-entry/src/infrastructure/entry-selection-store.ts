import type { DraftStore } from '@dukani/platform';
import type { EntrySelection } from '../domain/entry-selection.types';
export function createEntrySelectionStore(drafts: DraftStore, userId: () => string) {
  const queues = new Map<string, Promise<unknown>>();
  const key = (storeId: string, itemId: string) => ({
    storeId,
    userId: userId(),
    flow: 'entry-selection',
    id: itemId,
  });
  return {
    async read(storeId: string, itemId: string): Promise<EntrySelection | null> {
      const value = (await drafts.get<EntrySelection>(key(storeId, itemId)))?.data ?? null;
      if (value && value.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
      return value;
    },
    write(storeId: string, itemId: string, value: EntrySelection): Promise<void> {
      const scope = key(storeId, itemId);
      const queueKey = scope.userId + ':' + storeId + ':' + itemId;
      const task = (queues.get(queueKey) ?? Promise.resolve()).then(async () => {
        await drafts.put(scope, value);
      });
      queues.set(
        queueKey,
        task.catch(() => undefined),
      );
      return task;
    },
  };
}
