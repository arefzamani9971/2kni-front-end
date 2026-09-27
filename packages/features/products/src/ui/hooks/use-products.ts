'use client';
import { createQueryKeys, useAppInfiniteQuery, useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { ProductFilter } from '../../domain/product';
import { useProductsModule } from '../../module';

/** Same scope as other features invalidate (`['products', storeId]`) after entry/purchase. */
export const productKeys = createQueryKeys('products');

export const useProductList = (filter: ProductFilter) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppInfiniteQuery({
    queryKey: productKeys(store.id).list(filter),
    queryFn: ({ signal, cursor }) => products.list(store.id, filter, cursor, signal),
  });
};

export const useProduct = (productId: string) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: productKeys(store.id).detail(productId), queryFn: ({ signal }) => products.get(store.id, productId, signal) });
};

export const useMovements = (productId: string) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: productKeys(store.id).custom('movements', productId),
    queryFn: ({ signal }) => products.movements(store.id, productId, signal),
  });
};
