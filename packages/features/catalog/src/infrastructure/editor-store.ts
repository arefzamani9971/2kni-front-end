import { appError } from '@dukani/domain';
import type { DraftStore } from '@dukani/platform';
import type { CatalogEditorStore } from '../application/editor-store.types';

export function createEditorStore(drafts: DraftStore, userId: () => string): CatalogEditorStore {
  const key = (storeId: string, id: string) => ({ storeId, id, userId: userId(), flow: 'catalog-editor' });
  return {
    async read<T>(storeId: string, id: string) {
      const draft = await drafts.get<{ schemaVersion: number; value: T }>(key(storeId, id));
      if (!draft) return null;
      if (draft.data.schemaVersion !== 1)
        throw appError('BusinessRule', 'DRAFT_SCHEMA_UNSUPPORTED', '', { messageSource: 'fallback' });
      return draft.data.value;
    },
    async write(storeId, id, value) {
      await drafts.put(key(storeId, id), { schemaVersion: 1, value });
    },
    remove(storeId, id) {
      return drafts.remove(key(storeId, id));
    },
  };
}
