import type { EntrySelection } from './entry-selection.types';

/** The store's own name and note for a catalog item, as the draft keeps them (an empty text stays empty, not null). */
export const entrySelectionOf = (values: {
  readonly localTitle?: string | null;
  readonly localNote?: string | null;
}): EntrySelection => ({
  schemaVersion: 1,
  localTitle: values.localTitle ?? '',
  localNote: values.localNote ?? '',
});
