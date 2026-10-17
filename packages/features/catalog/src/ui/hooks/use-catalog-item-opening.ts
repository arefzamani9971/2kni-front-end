'use client';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CatalogItemSummary } from '../../domain/catalog.types';
import type { CatalogItemOpening } from './catalog-item-opening.types';

/**
 * Opens one row at a time (a second click while a row is opening does nothing). `open` stays the same function
 * across renders, so the grid rows never re-render for it; only the row buttons read the opening state.
 */
export function useCatalogItemOpening(
  onSelectItem: (id: string, storeProductId: string | null) => Promise<void>,
): CatalogItemOpening {
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const select = useRef(onSelectItem);
  const busy = useRef(false);
  useLayoutEffect(() => {
    select.current = onSelectItem;
  });
  const open = useCallback((item: CatalogItemSummary) => {
    if (busy.current) return;
    busy.current = true;
    setOpeningId(item.id);
    setFailed(false);
    select
      .current(item.id, item.myStoreProductId)
      .catch(() => setFailed(true))
      .finally(() => {
        busy.current = false;
        setOpeningId(null);
      });
  }, []);
  return useMemo(() => ({ openingId, failed, open }), [openingId, failed, open]);
}
