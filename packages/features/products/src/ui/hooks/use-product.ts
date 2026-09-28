'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

export const useProduct = (productId: string) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: productKeys(store.id).detail(productId), queryFn: ({ signal }) => products.get(store.id, productId, signal) });
};
