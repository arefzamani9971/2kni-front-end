'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductsModule } from '../../module';
import { productKeys } from './product-keys';

/** The store's correction requests for the product's catalog item (status on the detail page, F11 §7). */
export const useItemCorrections = (catalogItemId: string | undefined) => {
  const { products } = useProductsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: productKeys(store.id).custom('corrections', catalogItemId),
    queryFn: ({ signal }) => products.corrections(store.id, catalogItemId!, signal),
    enabled: !!catalogItemId,
  });
};
