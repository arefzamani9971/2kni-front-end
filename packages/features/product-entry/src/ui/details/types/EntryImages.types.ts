import type { EntryDraft } from '../../../domain/entry-draft.types';

export type EntryImage = NonNullable<NonNullable<EntryDraft['newItem']>['images']>[number];
