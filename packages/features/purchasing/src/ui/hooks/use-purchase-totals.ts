'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';

export const usePurchaseTotals = (purchaseId: string, version: number | undefined) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: purchaseKeys(store.id).custom('totals', purchaseId, version),
    queryFn: ({ signal }) => purchases.totals(store.id, purchaseId, signal),
    enabled: version !== undefined,
  });
};
