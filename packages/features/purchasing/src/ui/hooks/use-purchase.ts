'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';

export const usePurchase = (purchaseId: string) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: purchaseKeys(store.id).detail(purchaseId), queryFn: ({ signal }) => purchases.get(store.id, purchaseId, signal) });
};
