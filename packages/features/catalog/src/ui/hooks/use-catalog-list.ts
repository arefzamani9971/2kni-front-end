'use client';
import { useAppList } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { CatalogItemFilter, CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';
import { useCatalogModule } from '../../module';
import { CATALOG_LIST_SORT } from '../../domain/catalog-list.constants';

/**
 * The catalog list (F07 CAT-13) on the shared remote list: desktop pages, mobile infinite cards, title sort.
 * The applied filter starts from the URL; the `['catalog', storeId]` invalidations refresh it.
 */
export function useCatalogList(initialFilter: CatalogItemFilter) {
  const { id: storeId } = useActiveStore();
  const { catalog } = useCatalogModule();
  return useAppList<CatalogItemSummary, CatalogItemFilter, CatalogItemSort>({
    queryKey: ['catalog', storeId, 'items'],
    initialFilter,
    initialSort: CATALOG_LIST_SORT,
    read: (query, { signal }) => catalog.itemPage(storeId, query, signal),
  });
}
