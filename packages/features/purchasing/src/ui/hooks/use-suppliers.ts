'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { usePurchasingModule } from '../../module';
import { supplierKeys } from './supplier-keys';

export const useSuppliers = () => {
  const { suppliers } = usePurchasingModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: supplierKeys(store.id).list(), queryFn: ({ signal }) => suppliers.list(store.id, signal) });
};
