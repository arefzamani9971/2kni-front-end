'use client';
import { useAppInfiniteQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { PurchaseQuery } from '../../application/ports';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';

export const usePurchaseList = (query: PurchaseQuery) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppInfiniteQuery({
    queryKey: purchaseKeys(store.id).list(query),
    queryFn: ({ signal, cursor }) => purchases.list(store.id, query, cursor, signal),
  });
};
