'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './use-entry';

const HOUR = 60 * 60_000;

export const useProductTypes = () => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: entryKeys(store.id).custom('types'), queryFn: ({ signal }) => catalog.productTypes(store.id, signal), staleTime: HOUR });
};

export const useProductType = (productTypeId: string) => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: entryKeys(store.id).custom('type', productTypeId),
    queryFn: ({ signal }) => catalog.productType(store.id, productTypeId, signal),
    enabled: !!productTypeId,
    staleTime: HOUR,
  });
};

export const useBrands = () => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: entryKeys(store.id).custom('brands'), queryFn: ({ signal }) => catalog.brands(store.id, signal), staleTime: HOUR });
};

export const useTitleCheck = (title: string) => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: entryKeys(store.id).custom('title-check', title),
    queryFn: ({ signal }) => catalog.titleCheck(store.id, title, signal),
    enabled: title.trim().length >= 3,
    staleTime: 30_000,
  });
};

export const useSuppliers = () => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({ queryKey: entryKeys(store.id).custom('suppliers'), queryFn: ({ signal }) => catalog.suppliers(store.id, signal) });
};
