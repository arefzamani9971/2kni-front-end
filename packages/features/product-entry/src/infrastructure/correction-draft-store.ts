import type { DraftStore } from '@dukani/platform';
import type { CorrectionDraft } from '../domain/correction-draft.types';
export const createCorrectionDraftStore = (drafts: DraftStore, userId: () => string) => {
  const queues = new Map<string, Promise<unknown>>();
  return {
    async read(storeId: string, itemId: string) {
      const actorId = userId();
      await queues.get(actorId + ':' + storeId + ':' + itemId);
      const stored = await drafts.get<{ schemaVersion: 1; value: CorrectionDraft }>({
        storeId,
        userId: actorId,
        flow: 'entry-correction',
        id: itemId,
      });
      if (stored && stored.data.schemaVersion !== 1) throw new Error('UNSUPPORTED_DRAFT_SCHEMA');
      return stored?.data.value ?? null;
    },
    async write(storeId: string, itemId: string, value: CorrectionDraft) {
      const scope = { storeId, userId: userId(), flow: 'entry-correction', id: itemId };
      const key = scope.userId + ':' + storeId + ':' + itemId;
      const task = (queues.get(key) ?? Promise.resolve()).then(() =>
        drafts.put(scope, { schemaVersion: 1, value }),
      );
      queues.set(
        key,
        task.catch(() => undefined),
      );
      await task;
    },
  };
};
