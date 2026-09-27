// IndexedDB adapter (the only file that knows about `idb`).
import { openDB, type IDBPDatabase } from 'idb';
import { draftKeyString, type Draft, type DraftKey, type DraftStore } from '../drafts/draft-store';

const DB_NAME = 'dukani';
const STORE = 'drafts';

export const createIdbDraftStore = (): DraftStore => {
  let db: Promise<IDBPDatabase> | null = null;
  const open = () =>
    (db ??= openDB(DB_NAME, 1, {
      upgrade(database) {
        const s = database.createObjectStore(STORE, { keyPath: 'key' });
        s.createIndex('scope', 'scope');
      },
    }));
  const scopeOf = (k: Omit<DraftKey, 'id'>) => `${k.storeId}:${k.userId}:${k.flow}`;
  return {
    async get<T>(key: DraftKey) {
      const row = await (await open()).get(STORE, draftKeyString(key));
      return (row?.draft as Draft<T> | undefined) ?? null;
    },
    async put<T>(key: DraftKey, data: T) {
      const draft: Draft<T> = { ...key, data, updatedAt: new Date().toISOString() };
      await (await open()).put(STORE, { key: draftKeyString(key), scope: scopeOf(key), draft });
      return draft;
    },
    async list<T>(scope: Omit<DraftKey, 'id'>) {
      const rows = await (await open()).getAllFromIndex(STORE, 'scope', scopeOf(scope));
      return rows.map((r) => r.draft as Draft<T>);
    },
    async remove(key: DraftKey) {
      await (await open()).delete(STORE, draftKeyString(key));
    },
  };
};
