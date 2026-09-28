'use client';
import type { Dto } from '@dukani/contracts';
import { useAppMutation } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { supplierKeys } from './supplier-keys';

export const useCreateSupplier = () => {
  const { suppliers } = usePurchasingModule();
  const store = useActiveStore();
  return useAppMutation<Dto<'SupplierDto'>, string>({
    mutationFn: (name) => suppliers.create(store.id, { name }),
    invalidates: [supplierKeys(store.id).list()],
  });
};
