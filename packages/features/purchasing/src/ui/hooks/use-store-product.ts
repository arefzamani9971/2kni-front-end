'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';

export const useStoreProduct = (productId: string | null) => {
  const { products } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: ['products', store.id, 'detail', productId],
    queryFn: ({ signal }) => products.get(store.id, productId!, signal),
    enabled: !!productId,
  });
};
