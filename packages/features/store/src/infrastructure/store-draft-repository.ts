import type { DraftStore } from '@dukani/platform';
import type { StoreDraftRepository } from '../application/ports';
import { DRAFT_FLOW, DRAFT_ID, PENDING_STORE } from '../domain/store-draft.constants';
import type { StoreDraft } from '../domain/store-draft.types';

/** DraftStore adapter: key `pending:userId:store-create:current`, so drafts never cross accounts (F02-S20). */
export const createStoreDrafts = (drafts: DraftStore, userId: () => string): StoreDraftRepository => {
  const key = () => ({ storeId: PENDING_STORE, userId: userId(), flow: DRAFT_FLOW, id: DRAFT_ID });
  return {
    load: async () => (await drafts.get<StoreDraft>(key()))?.data ?? null,
    save: async (draft) => void (await drafts.put(key(), draft)),
    clear: () => drafts.remove(key()),
  };
};
