'use client';
import { useAppQuery } from '@dukani/data';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';

export const useStore = (storeId: string) => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys(storeId).detail(storeId), queryFn: ({ signal }) => stores.get(storeId, signal), staleTime: 5 * 60_000 });
};
