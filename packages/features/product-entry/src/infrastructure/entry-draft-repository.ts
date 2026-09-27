import type { DraftStore } from '@dukani/platform';
import type { EntryDrafts } from '../application/ports';
import type { EntryDraft } from '../domain/entry-draft';

const FLOW = 'product-entry';

/** DraftStore adapter; the user id scopes drafts on shared devices. */
export const createEntryDrafts = (drafts: DraftStore, userId: () => string): EntryDrafts => ({
  async get(storeId, id) {
    return (await drafts.get<EntryDraft>({ storeId, userId: userId(), flow: FLOW, id }))?.data ?? null;
  },
  async save(storeId, draft) {
    return (await drafts.put({ storeId, userId: userId(), flow: FLOW, id: draft.id }, draft)).data;
  },
  remove: (storeId, id) => drafts.remove({ storeId, userId: userId(), flow: FLOW, id }),
});
