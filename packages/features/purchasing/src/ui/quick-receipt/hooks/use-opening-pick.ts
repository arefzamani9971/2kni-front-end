'use client';
import { useAppList } from '@dukani/data';
import { newUuid } from '@dukani/domain';
import { useActiveStore, useNavigation, useSearchTerm } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useSelectedIds, useSelection } from '@dukani/ui-kit';
import { useEffect, useRef, useState } from 'react';
import { createOpeningQueue } from '../../../domain/opening-queue';
import type { ProductPageFilter, ProductPageRow, ProductPageSort } from '../../../domain/product-page.types';
import { usePurchasingModule } from '../../../module';
import { purchaseKeys } from '../../common/state/purchase-keys';

/**
 * The opening pick (CPB-04, Figma 1255:61 / 1255:141): one server page of the store's goods at a time
 * (page/pageSize/sortModel, exact total), stock history per row, a selection of record ids that survives paging,
 * and the start of a queue with the chosen products in a local draft. Products with history cannot be chosen.
 */
export function useOpeningPick() {
  const { productPages, receiptDrafts } = usePurchasingModule();
  const store = useActiveStore();
  const nav = useNavigation();
  const [text, setText] = useState('');
  const search = useSearchTerm(text);
  const list = useAppList<ProductPageRow, ProductPageFilter, ProductPageSort>({
    queryKey: purchaseKeys(store.id).custom('opening-pick'),
    initialFilter: {},
    initialSort: [{ field: 'title', direction: 'asc' }],
    read: (query, { signal }) => productPages.page(store.id, query, signal),
  });
  const { applyFilter } = list;
  useEffect(() => {
    if (search.state !== 'waiting') applyFilter({ q: search.term || undefined });
  }, [search.term, search.state, applyFilter]);
  const selection = useSelection();
  const selected = useSelectedIds(selection);
  // the selection holds ids across pages; their titles come from the rows the seller saw
  const seen = useRef(new Map<string, ProductPageRow>());
  useEffect(() => {
    for (const row of [...list.pageView.items, ...list.infiniteView.items]) seen.current.set(row.id, row);
  }, [list.pageView.items, list.infiniteView.items]);
  const [starting, setStarting] = useState(false);
  const [failed, setFailed] = useState(false);
  const start = async () => {
    const products = [...selected]
      .map((id) => seen.current.get(id))
      .filter((row): row is ProductPageRow => !!row && !row.hasStockHistory)
      .map((row) => ({ productId: row.id, title: row.title }));
    if (starting || products.length === 0) return;
    setStarting(true);
    setFailed(false);
    try {
      const queue = createOpeningQueue(newUuid(), products);
      await receiptDrafts.saveQueue(store.id, queue);
      nav.push(sellerRoutes.purchases.openingQueue(store.id, queue.id));
    } catch {
      setFailed(true);
      setStarting(false);
    }
  };
  return { list, selection, count: selected.size, text, setText, start, starting, failed };
}
