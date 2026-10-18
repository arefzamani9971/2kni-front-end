import type { EntrySelection } from '../../domain/entry-selection.types';

export type SelectionStart = {
  readonly catalogItemId: string;
  /** The store product the stock goes to, when the item is already in the store. */
  readonly storeProductId: string | null;
  readonly selection: EntrySelection;
  /** Persists the typed input first; false when that write failed (the entry is then not started). */
  readonly persist: () => Promise<boolean>;
};
