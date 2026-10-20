'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore, useSearchTerm } from '@dukani/platform';
import type { AutocompleteStatus } from '@dukani/ui-kit';
import { useState } from 'react';
import type { ProductPageRow } from '../../domain/product-page.types';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';
import { AUTOCOMPLETE_PAGE_SIZE } from './use-product-autocomplete.constants';

/**
 * The purchase product search under the shared autocomplete policy (spec/front/autocomplete.md): nothing below 3
 * meaningful characters, one request 300ms after typing stops, keyed by store and term so a late answer for an older
 * term is never shown, aborted with its query. Choosing a result only identifies the product.
 */
export function useProductAutocomplete() {
  const { productPages } = usePurchasingModule();
  const store = useActiveStore();
  const [query, setQuery] = useState('');
  const search = useSearchTerm(query);
  const result = useAppQuery({
    queryKey: purchaseKeys(store.id).custom('product-autocomplete', search.term),
    queryFn: ({ signal }) =>
      productPages.page(
        store.id,
        {
          page: 1,
          pageSize: AUTOCOMPLETE_PAGE_SIZE,
          sort: [{ field: 'title', direction: 'asc' }],
          filter: { q: search.term },
        },
        signal,
      ),
    enabled: !!search.term,
    staleTime: 30_000,
  });
  const items: readonly ProductPageRow[] = search.state === 'ready' ? (result.data?.items ?? []) : [];
  const status: AutocompleteStatus =
    search.state === 'empty' || search.state === 'short'
      ? 'belowMinimum'
      : search.state === 'waiting'
        ? 'debouncing'
        : result.isError
          ? 'error'
          : !result.data
            ? 'loading'
            : items.length
              ? 'results'
              : 'empty';
  return {
    query,
    setQuery,
    items,
    status,
    retry: () => void result.refetch(),
    /** Enter settles the typed text at once. */
    flush: search.flush,
  };
}
