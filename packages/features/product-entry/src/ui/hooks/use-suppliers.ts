'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './entry-keys';

export const useSuppliers = () => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: entryKeys(store.id).custom('suppliers'), queryFn: ({ signal }) => catalog.suppliers(store.id, signal) });
};
