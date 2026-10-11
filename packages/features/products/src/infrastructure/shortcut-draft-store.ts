import type { DraftStore } from '@dukani/platform';
import type { ShortcutDraft } from '../domain/shortcut.types';
export const createShortcutDrafts = (drafts: DraftStore, userId: () => string) => {
  const queues = new Map<string, Promise<unknown>>();
  return {
    async read(storeId: string) {
      const scope = { storeId, userId: userId(), flow: 'product-shortcuts', id: 'current' };
      await queues.get(scope.userId + ':' + storeId);
      const stored = (await drafts.get<ShortcutDraft>(scope))?.data;
      if (stored && stored.schemaVersion !== 1) throw new Error('UNSUPPORTED_DRAFT_SCHEMA');
      return stored ?? null;
    },
    async write(storeId: string, value: ShortcutDraft) {
      const scope = { storeId, userId: userId(), flow: 'product-shortcuts', id: 'current' };
      const key = scope.userId + ':' + storeId;
      const task = (queues.get(key) ?? Promise.resolve()).then(() => drafts.put(scope, value));
      queues.set(
        key,
        task.catch(() => undefined),
      );
      await task;
    },
  };
};
