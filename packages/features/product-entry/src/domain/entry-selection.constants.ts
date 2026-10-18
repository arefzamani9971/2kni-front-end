import type { EntrySelection } from './entry-selection.types';

/** Server limits of the store's own name and private note (`RegisterProductRequest.localTitle` / `localNote`). */
export const SELECTION_TITLE_MAX = 250;
export const SELECTION_NOTE_MAX = 1000;

/** Nothing typed yet for a catalog item. */
export const EMPTY_SELECTION: EntrySelection = { schemaVersion: 1, localTitle: '', localNote: '' };
