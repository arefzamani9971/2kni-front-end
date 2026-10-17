import type { Dto } from '@dukani/contracts';
import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { schemaFor } from './StockForm.schema';

export type Kind = Dto<'PurchaseKind'>;

export type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;

type StockSchema = ReturnType<typeof schemaFor>;
/** The stock step form, shared by the step and its live conversion leaf. */
export type StockAppForm = AppForm<InferInput<StockSchema>, Infer<StockSchema>>;
