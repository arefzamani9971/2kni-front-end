/** A locally saved draft (cart, product-entry wizard, purchase receipt…). Drafts are never final records. */
export type Draft<T> = {
  readonly id: string;
  readonly flow: string;
  readonly storeId: string;
  readonly userId: string;
  readonly data: T;
  readonly updatedAt: string;
};

export type DraftKey = { readonly storeId: string; readonly userId: string; readonly flow: string; readonly id: string };

/** Port. Adapters: IndexedDB (browser) and memory (tests/SSR). Keyed by store + user + flow + id (BIZ-ACC-05). */
export type DraftStore = {
  get<T>(key: DraftKey): Promise<Draft<T> | null>;
  put<T>(key: DraftKey, data: T): Promise<Draft<T>>;
  list<T>(scope: Omit<DraftKey, 'id'>): Promise<Draft<T>[]>;
  remove(key: DraftKey): Promise<void>;
};

export const draftKeyString = (k: DraftKey) => `${k.storeId}:${k.userId}:${k.flow}:${k.id}`;

export const createMemoryDraftStore = (): DraftStore => {
  const map = new Map<string, Draft<unknown>>();
  return {
    get: async <T,>(key: DraftKey) => (map.get(draftKeyString(key)) as Draft<T> | undefined) ?? null,
    put: async <T,>(key: DraftKey, data: T) => {
      const draft: Draft<T> = { ...key, data, updatedAt: new Date().toISOString() };
      map.set(draftKeyString(key), draft);
      return draft;
    },
    list: async <T,>(scope: Omit<DraftKey, 'id'>) =>
      [...map.values()].filter(
        (d) => d.storeId === scope.storeId && d.userId === scope.userId && d.flow === scope.flow,
      ) as Draft<T>[],
    remove: async (key) => void map.delete(draftKeyString(key)),
  };
};
