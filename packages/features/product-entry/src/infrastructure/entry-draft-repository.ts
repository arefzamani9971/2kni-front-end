import type { DraftStore } from '@dukani/platform';
import type { EntryDrafts } from '../application/ports';
import type { EntryDraft } from '../domain/entry-draft.types';
import { FLOW } from './entry-draft-repository.constants';

/** DraftStore adapter; the user id scopes drafts on shared devices. */
export const createEntryDrafts = (drafts: DraftStore, userId: () => string): EntryDrafts => ({
  async get(storeId, id) {
    const saved = (
      await drafts.get<EntryDraft | { schemaVersion: number; draft: EntryDraft }>({
        storeId,
        userId: userId(),
        flow: FLOW,
        id,
      })
    )?.data;
    if (!saved) return null;
    if ('schemaVersion' in saved) {
      if (saved.schemaVersion !== 1) throw new Error('DRAFT_SCHEMA_UNSUPPORTED');
      return saved.draft;
    }
    return saved; // Previous unversioned drafts remain readable; the next write migrates them.
  },
  async save(storeId, draft) {
    await drafts.put({ storeId, userId: userId(), flow: FLOW, id: draft.id }, { schemaVersion: 1, draft });
    return draft;
  },
  remove: (storeId, id) => drafts.remove({ storeId, userId: userId(), flow: FLOW, id }),
});
