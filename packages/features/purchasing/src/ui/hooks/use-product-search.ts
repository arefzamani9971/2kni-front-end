'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { purchaseKeys } from './purchase-keys';

export const useProductSearch = (q: string, enabled: boolean) => {
  const { products } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: purchaseKeys(store.id).custom('product-search', q),
    queryFn: ({ signal }) => products.search(store.id, q, signal),
    enabled,
  });
};
