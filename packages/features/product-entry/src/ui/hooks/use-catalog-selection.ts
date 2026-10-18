'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';

/**
 * The catalog item being chosen and, when the seller picked one already in the store, that store product (its
 * catalog item is then read from it). Read-only: the typed name and note and the start live elsewhere.
 */
export function useCatalogSelection(itemId?: string, productId?: string) {
  const store = useActiveStore();
  const { catalog } = useProductEntryModule();
  const product = useAppQuery({
    queryKey: ['entry-selection', store.id, 'local', productId],
    enabled: !!productId,
    queryFn: ({ signal }) => catalog.storeProduct(store.id, productId!, signal),
  });
  const id = itemId ?? product.data?.catalogItemId;
  const item = useAppQuery({
    queryKey: ['entry-selection', store.id, 'catalog', id],
    enabled: !!id,
    queryFn: ({ signal }) => catalog.catalogItem(store.id, id!, signal),
  });
  return {
    id,
    item: item.data,
    product: product.data,
    error: item.error ?? product.error,
    retry: () => {
      if (product.error) void product.refetch();
      if (item.error) void item.refetch();
    },
  };
}
