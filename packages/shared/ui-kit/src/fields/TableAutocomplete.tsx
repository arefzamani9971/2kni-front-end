'use client';
import { useViewport } from '../responsive/use-viewport';
import type { TableAutocompleteProps } from './TableAutocomplete.types';
import { TableAutocompleteDesktop } from './TableAutocompleteDesktop';
import { TableAutocompleteMobile } from './TableAutocompleteMobile';

/**
 * Table Autocomplete (spec/front/autocomplete.md): one selection controller with column suggestions on desktop and
 * a full-screen picker on mobile. Generic over the item; the feature supplies the data, the search policy
 * (`useSearchTerm`) and the status — the component never makes a request.
 */
export function TableAutocomplete<T>(props: TableAutocompleteProps<T>) {
  return useViewport() === 'desktop' ? (
    <TableAutocompleteDesktop {...props} />
  ) : (
    <TableAutocompleteMobile {...props} />
  );
}
