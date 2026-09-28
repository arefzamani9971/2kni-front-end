'use client';
import { useAppQuery } from '@dukani/data';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';

export const useMyStores = () => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys().list(), queryFn: () => stores.myStores() });
};
