'use client';
import type { Dto } from '@dukani/contracts';
import { useAppMutation } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../../module';
import { supplierKeys } from '../state/supplier-keys';

/** `POST …/suppliers` (create in place, F71 dependency of F13); the list is read again afterwards. */
export const useCreateSupplier = () => {
  const { suppliers } = usePurchasingModule();
  const store = useActiveStore();
  return useAppMutation<Dto<'SupplierDto'>, Dto<'UpsertSupplierRequest'>>({
    mutationFn: (body) => suppliers.create(store.id, body),
    invalidates: [supplierKeys(store.id).list()],
  });
};
