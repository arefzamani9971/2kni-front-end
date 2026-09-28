'use client';
import { useAppInfiniteQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { ProductFilter } from '../../domain/product';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

export const useProductList = (filter: ProductFilter) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppInfiniteQuery({
    queryKey: productKeys(store.id).list(filter),
    queryFn: ({ signal, cursor }) => products.list(store.id, filter, cursor, signal),
  });
};
