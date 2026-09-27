'use client';
import type { Dto } from '@dukani/contracts';
import { createQueryKeys, useAppInfiniteQuery, useAppMutation, useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import type { PurchaseQuery } from '../../application/ports';
import { usePurchasingModule } from '../../module';

export const purchaseKeys = createQueryKeys('purchases');
const supplierKeys = createQueryKeys('suppliers');

export const usePurchaseList = (query: PurchaseQuery) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppInfiniteQuery({
    queryKey: purchaseKeys(store.id).list(query),
    queryFn: ({ signal, cursor }) => purchases.list(store.id, query, cursor, signal),
  });
};

export const usePurchase = (purchaseId: string) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: purchaseKeys(store.id).detail(purchaseId), queryFn: ({ signal }) => purchases.get(store.id, purchaseId, signal) });
};

export const usePurchaseTotals = (purchaseId: string, version: number | undefined) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: purchaseKeys(store.id).custom('totals', purchaseId, version),
    queryFn: ({ signal }) => purchases.totals(store.id, purchaseId, signal),
    enabled: version !== undefined,
  });
};

/** PUT the whole draft; the returned DTO (new version) replaces the cached one. */
export const useSaveDraft = (purchaseId: string) => {
  const { purchases } = usePurchasingModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  return useAppMutation<Dto<'PurchaseDto'>, Dto<'UpdatePurchaseDraftRequest'>>({
    mutationFn: (body) => purchases.updateDraft(store.id, purchaseId, body),
    onSuccess: (dto) => {
      cache.set(purchaseKeys(store.id).detail(purchaseId), dto);
    },
    invalidates: [purchaseKeys(store.id).list()],
  });
};

export const useSuppliers = () => {
  const { suppliers } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: supplierKeys(store.id).list(), queryFn: ({ signal }) => suppliers.list(store.id, signal) });
};

export const useCreateSupplier = () => {
  const { suppliers } = usePurchasingModule();
  const store = useActiveStore();
  return useAppMutation<Dto<'SupplierDto'>, string>({
    mutationFn: (name) => suppliers.create(store.id, { name }),
    invalidates: [supplierKeys(store.id).list()],
  });
};

export const useProductSearch = (q: string, enabled: boolean) => {
  const { products } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: purchaseKeys(store.id).custom('product-search', q),
    queryFn: ({ signal }) => products.search(store.id, q, signal),
    enabled,
  });
};

export const useStoreProduct = (productId: string | null) => {
  const { products } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: ['products', store.id, 'detail', productId],
    queryFn: ({ signal }) => products.get(store.id, productId!, signal),
    enabled: !!productId,
  });
};
