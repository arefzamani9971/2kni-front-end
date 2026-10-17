'use client';
import type { Dto } from '@dukani/contracts';
import { useAppMutation, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

type Action = 'archive' | 'restore';

/**
 * Archive and restore of one store product (PRD-ARCHIVE, F11 §8) with the version on screen. Both are no-ops when
 * repeated, so a lost response is recovered by reading the product again; a 409 shows the fresh product first.
 */
export function useProductLifecycle(product: Dto<'StoreProductDto'>) {
  const store = useActiveStore();
  const { products } = useProductsModule();
  const cache = useQueryCache();
  const keys = productKeys(store.id);
  const mutation = useAppMutation<Dto<'StoreProductDto'>, Action>({
    mutationFn: (action) =>
      action === 'archive'
        ? products.archive(store.id, product.id, product.version)
        : products.restore(store.id, product.id, product.version),
    onSuccess: (fresh) => cache.set(keys.detail(fresh.id), fresh),
    // a 409 or lost response: show the server's current state before anything is retried
    onError: () =>
      void products.get(store.id, product.id).then(
        (fresh) => cache.set(keys.detail(fresh.id), fresh),
        () => undefined,
      ),
    invalidates: [keys.list()],
  });
  /** Rejects with the AppError, so the confirmation stays open and shows it. */
  return (action: Action) => mutation.mutateAsync(action);
}
