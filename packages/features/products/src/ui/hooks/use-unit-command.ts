'use client';
import { useEffect } from 'react';
import type { Dto } from '@dukani/contracts';
import { useFinalCommand, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';
import type { UnitCommand } from './use-unit-command.types';

/**
 * Adds a unit or changes a unit's price and uses (F12 §4–§5) with one Idempotency-Key per action: a lost response is
 * replayed with the same key, then reported as unknown with «بررسی دوباره». The answer is the canonical product; it
 * replaces the cached detail (the purchase line editor reads the same entry). A stale version (409) loads the fresh
 * product so the kept input is saved again against it.
 */
export function useUnitCommand(product: Dto<'StoreProductDto'>) {
  const store = useActiveStore();
  const { products } = useProductsModule();
  const cache = useQueryCache();
  const keys = productKeys(store.id);
  const command = useFinalCommand<UnitCommand, Dto<'StoreProductDto'>>({
    run: (c, operationId) =>
      c.kind === 'add'
        ? products.addUnit(store.id, product.id, c.body, operationId)
        : products.updateUnit(store.id, product.id, c.unitId, c.body, operationId),
    onSuccess: (fresh) => cache.set(keys.detail(fresh.id), fresh),
    // lists and the entry lookups show units; a failed refresh never turns the saved unit into a failure
    invalidates: [keys.list(), ['entry', store.id]],
  });
  const conflict = command.state.kind === 'failed' && command.state.error.code === 'VERSION_CONFLICT';
  useEffect(() => {
    if (!conflict) return;
    void products.get(store.id, product.id).then(
      (fresh) => cache.set(productKeys(store.id).detail(fresh.id), fresh),
      () => undefined,
    );
  }, [conflict, products, store.id, product.id, cache]);
  return { ...command, conflict };
}
