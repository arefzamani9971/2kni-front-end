import type { AppForm, Infer, InferInput } from '@dukani/forms';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { schema } from './NewItemDetails.schema';

export type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;

type DetailsSchema = ReturnType<typeof schema>;
/** The details form shared by the details sections. */
export type DetailsForm = AppForm<InferInput<DetailsSchema>, Infer<DetailsSchema>>;

/** A brand or product type being created in place from the details step. */
export type DetailsCreation = { readonly kind: 'brand' | 'type'; readonly name: string };

/** Which part of the details step is open. */
export type DetailsScene = 'main' | 'attributes' | 'images';
