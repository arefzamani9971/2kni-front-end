import type { EntryDraft } from '../../domain/entry-draft.types';

export type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
