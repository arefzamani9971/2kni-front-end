import type { Draft, DraftKey, DraftStore } from './draft-store.types';

export const draftKeyString = (k: DraftKey) => `${k.storeId}:${k.userId}:${k.flow}:${k.id}`;

export const createMemoryDraftStore = (): DraftStore => {
  const map = new Map<string, Draft<unknown>>();
  return {
    get: async <T>(key: DraftKey) => (map.get(draftKeyString(key)) as Draft<T> | undefined) ?? null,
    put: async <T>(key: DraftKey, data: T) => {
      const draft: Draft<T> = { ...key, data, updatedAt: new Date().toISOString() };
      map.set(draftKeyString(key), draft);
      return draft;
    },
    list: async <T>(scope: Omit<DraftKey, 'id'>) =>
      [...map.values()].filter(
        (d) => d.storeId === scope.storeId && d.userId === scope.userId && d.flow === scope.flow,
      ) as Draft<T>[],
    remove: async (key) => void map.delete(draftKeyString(key)),
  };
};
