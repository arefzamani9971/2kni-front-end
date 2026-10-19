'use client';
import type { EntrySearchFilters } from '../../../application/ports';
import { EntrySelectionScreen } from './EntrySelectionScreen';
import { SearchResults } from '../components/SearchResults';

export function EntrySearchScreen({
  query,
  itemId,
  productId,
  bulk = false,
  filters = {},
}: {
  query: string;
  itemId?: string;
  productId?: string;
  bulk?: boolean;
  filters?: EntrySearchFilters;
}) {
  return itemId || productId ? (
    <EntrySelectionScreen query={query} itemId={itemId} productId={productId} bulk={bulk} filters={filters} />
  ) : (
    <SearchResults query={query} bulk={bulk} filters={filters} />
  );
}
