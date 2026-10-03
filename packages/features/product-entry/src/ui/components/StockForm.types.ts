import type { Dto } from '@dukani/contracts';
import type { EntryDraft } from '../../domain/entry-draft.types';

export type Kind = Dto<'PurchaseKind'>;

export type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
