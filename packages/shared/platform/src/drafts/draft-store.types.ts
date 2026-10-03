/** A locally saved draft (cart, product-entry wizard, purchase receipt…). Drafts are never final records. */
export type Draft<T> = {
  readonly id: string;
  readonly flow: string;
  readonly storeId: string;
  readonly userId: string;
  readonly data: T;
  readonly updatedAt: string;
};

export type DraftKey = {
  readonly storeId: string;
  readonly userId: string;
  readonly flow: string;
  readonly id: string;
};

/** Port. Adapters: IndexedDB (browser) and memory (tests/SSR). Keyed by store + user + flow + id (BIZ-ACC-05). */
export type DraftStore = {
  get<T>(key: DraftKey): Promise<Draft<T> | null>;
  put<T>(key: DraftKey, data: T): Promise<Draft<T>>;
  list<T>(scope: Omit<DraftKey, 'id'>): Promise<Draft<T>[]>;
  remove(key: DraftKey): Promise<void>;
};
