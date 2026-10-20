import type { AutocompleteController } from './use-autocomplete.types';
import type { TableAutocompleteProps } from './TableAutocomplete.types';

/** What both option renderers (desktop table rows, mobile cards) take from the field. */
export type AutocompleteOptionsProps<T> = Pick<
  TableAutocompleteProps<T>,
  | 'items'
  | 'columns'
  | 'getItemKey'
  | 'getItemLabel'
  | 'getOptionLabel'
  | 'isItemDisabled'
  | 'mobileSummary'
  | 'label'
> & {
  readonly control: AutocompleteController;
};
