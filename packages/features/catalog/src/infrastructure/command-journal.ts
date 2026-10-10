import { appError } from '@dukani/domain';
import type { DraftStore } from '@dukani/platform';
import type { CatalogIntent, CommandJournal } from '../application/command-journal.types';
/** Operation intent is private draft data: scoped by user, store, flow and host draft. */
export function createCommandJournal(drafts: DraftStore, userId: () => string): CommandJournal {
  const key = (storeId: string, id: string) => ({ storeId, id, userId: userId(), flow: 'catalog-command' });
  return {
    async read<T>(storeId: string, id: string) {
      const draft = await drafts.get<CatalogIntent<T>>(key(storeId, id));
      if (!draft) return null;
      if (draft.data.schemaVersion !== 1)
        throw appError('BusinessRule', 'DRAFT_SCHEMA_UNSUPPORTED', '', { messageSource: 'fallback' });
      return draft.data;
    },
    async write(storeId, id, intent) {
      await drafts.put(key(storeId, id), intent);
    },
    remove(storeId, id) {
      return drafts.remove(key(storeId, id));
    },
  };
}
