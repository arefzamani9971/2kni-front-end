'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

export const useMovements = (productId: string) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: productKeys(store.id).custom('movements', productId),
    queryFn: ({ signal }) => products.movements(store.id, productId, signal),
  });
};
