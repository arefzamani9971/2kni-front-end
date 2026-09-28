'use client';
import type { Dto } from '@dukani/contracts';
import { useAppMutation, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';

/** PUT the whole draft; the returned DTO (new version) replaces the cached one. */
export const useSaveDraft = (purchaseId: string) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  return useAppMutation<Dto<'PurchaseDto'>, Dto<'UpdatePurchaseDraftRequest'>>({
    mutationFn: (body) => purchases.updateDraft(store.id, purchaseId, body),
    onSuccess: (dto) => {
      cache.set(purchaseKeys(store.id).detail(purchaseId), dto);
    },
    invalidates: [purchaseKeys(store.id).list()],
  });
};
