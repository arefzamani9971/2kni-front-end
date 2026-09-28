'use client';
import { useAppQuery } from '@dukani/data';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';

export const useStoreTypes = () => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys().custom('types'), queryFn: () => stores.storeTypes(), staleTime: 60 * 60_000 });
};
