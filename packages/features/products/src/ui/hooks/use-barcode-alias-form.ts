'use client';
import { useState } from 'react';
import { useAppQuery, useQueryCache } from '@dukani/data';
import { useActiveStore, useCan } from '@dukani/platform';
import { isAppError, appError, type AppError } from '@dukani/domain';
import type { BarcodeAliasFormDraft } from '../../application/barcode-alias.types';
import { useProductsModule } from '../../module';

export function useBarcodeAliasForm(productId: string) {
  const store = useActiveStore();
  const allowed = useCan('product.manage');
  const { barcodeAliasDrafts: drafts } = useProductsModule();
  const cache = useQueryCache();
  const key = ['barcode-alias-form', store.id, productId];
  const query = useAppQuery({
    queryKey: key,
    queryFn: () => drafts.readForm(store.id, productId),
    enabled: allowed,
    staleTime: Infinity,
  });
  const [saveError, setSaveError] = useState<AppError>();
  const value: BarcodeAliasFormDraft = query.data ?? { schemaVersion: 1, unitId: '', barcode: '' };
  const update = (patch: Partial<Pick<BarcodeAliasFormDraft, 'unitId' | 'barcode'>>) => {
    if (!allowed || query.isPending) return;
    const next = { ...value, ...patch };
    cache.set(key, next);
    void drafts
      .writeForm(store.id, productId, next)
      .then(() => setSaveError(undefined))
      .catch((error) => setSaveError(isAppError(error) ? error : appError('Bug', 'LOCAL_STORAGE', '')));
  };
  const discard = async () => {
    await drafts.removeForm(store.id, productId);
    cache.set(key, null);
  };
  return {
    value,
    update,
    discard,
    loading: query.isPending,
    error: query.error,
    saveError,
    retry: query.refetch,
  };
}
