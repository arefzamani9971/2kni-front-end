'use client';
import { useRef } from 'react';
import type { Dto } from '@dukani/contracts';
import { useInvalidate, useQueryCache } from '@dukani/data';
import { appError, isAppError, newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

/**
 * Archives one unit (F12 §9) for the confirmation dialog: resolves when the unit is retired, rejects with the error
 * the dialog shows. A lost response keeps its Idempotency-Key, so «بایگانی» again replays it; the product is read
 * again first and an already retired unit counts as done. A stale version (409) shows the fresh product and the next
 * try is a new request against it.
 */
export function useUnitArchive(product: Dto<'StoreProductDto'>) {
  const store = useActiveStore();
  const { products } = useProductsModule();
  const cache = useQueryCache();
  const invalidate = useInvalidate();
  const keys = productKeys(store.id);
  const pending = useRef<{ readonly unitId: string; readonly id: OperationId } | null>(null);

  const accept = (fresh: Dto<'StoreProductDto'>) => {
    cache.set(keys.detail(fresh.id), fresh);
    void Promise.resolve(invalidate(keys.list())).catch(() => undefined);
  };

  return async (unit: Dto<'StoreProductUnitDto'>) => {
    if (pending.current?.unitId !== unit.id) pending.current = { unitId: unit.id, id: newOperationId() };
    try {
      accept(await products.archiveUnit(store.id, product.id, unit.id, product.version, pending.current.id));
      pending.current = null;
    } catch (caught) {
      const error = isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', String(caught));
      if (error.code === 'VERSION_CONFLICT' || error.kind === 'Unknown') {
        const fresh = await products.get(store.id, product.id).catch(() => null);
        if (fresh) accept(fresh);
        if (fresh?.units.find((u) => u.id === unit.id)?.archivedAt) {
          pending.current = null;
          return;
        }
      }
      if (error.kind !== 'Unknown') pending.current = null;
      throw error;
    }
  };
}
