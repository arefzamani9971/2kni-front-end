'use client';
import { useAppList } from '@dukani/data';
import type { ListInitialView } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import type { CatalogItemFilter, CatalogItemSort, CatalogItemSummary } from '../../domain/catalog.types';
import { useCatalogModule } from '../../module';

/**
 * The catalog list (F07 CAT-13) on the shared remote list: desktop pages, mobile infinite cards, title sort.
 * The applied filter and the page, size and sort start from the URL; the `['catalog', storeId]` invalidations
 * refresh it.
 */
export function useCatalogList(
  initialFilter: CatalogItemFilter,
  initialView: ListInitialView<CatalogItemSort>,
) {
  const { id: storeId } = useActiveStore();
  const { catalog } = useCatalogModule();
  return useAppList<CatalogItemSummary, CatalogItemFilter, CatalogItemSort>({
    queryKey: ['catalog', storeId, 'items'],
    initialFilter,
    ...initialView,
    read: (query, { signal }) => catalog.itemPage(storeId, query, signal),
  });
}
