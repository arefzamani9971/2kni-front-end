import type { ReactNode } from 'react';

/**
 * What the suggestion popup shows (spec/front/autocomplete.md): below the minimum no request is made, `debouncing`
 * waits for the typing to settle, `error` is not `empty` and offers a retry of the same query.
 */
export type AutocompleteStatus = 'belowMinimum' | 'debouncing' | 'loading' | 'results' | 'empty' | 'error';

/** One column of the suggestion table: a stable key, its header, a cell renderer, alignment and an optional width. */
export type AutocompleteColumn<T> = {
  readonly key: string;
  readonly header: ReactNode;
  readonly render: (item: T) => ReactNode;
  readonly align?: 'start' | 'end' | 'center';
  /** CSS grid track, e.g. `minmax(0,2fr)` or `8rem`; default `minmax(0,1fr)`. */
  readonly width?: string;
};

export type TableAutocompleteProps<T> = {
  readonly label: string;
  readonly hideLabel?: boolean;
  readonly placeholder?: string;
  readonly hint?: ReactNode;
  readonly query: string;
  /** The typed text; not called while an IME composition is in progress. */
  readonly onQueryChange: (query: string) => void;
  readonly items: readonly T[];
  readonly getItemKey: (item: T) => string;
  /** The option's title (first line of a mobile card). */
  readonly getItemLabel: (item: T) => string;
  /** One accessible name for the whole option, e.g. name, barcode and price; default the item label. */
  readonly getOptionLabel?: (item: T) => string;
  readonly isItemDisabled?: (item: T) => boolean;
  readonly columns: readonly AutocompleteColumn<T>[];
  /** The mobile card's second line; default the columns after the first, each with its header. */
  readonly mobileSummary?: (item: T) => ReactNode;
  /** Called once per choice; picking is not a confirmation of anything beyond the choice. */
  readonly onSelect: (item: T) => void;
  readonly status: AutocompleteStatus;
  readonly onRetry?: () => void;
  /** Enter without an active option, e.g. to settle the query at once; never a guessed selection. */
  readonly onSubmit?: () => void;
  /** The minimum shown in the below-minimum notice. */
  readonly minLength?: number;
  readonly disabled?: boolean;
  readonly className?: string;
};
