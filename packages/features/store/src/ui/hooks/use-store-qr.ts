'use client';
import { useAppQuery } from '@dukani/data';
import { useCan } from '@dukani/platform';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';

export function useStoreQr(storeId: string) {
  const { stores } = useStoreModule();
  const allowed = useCan('store.settings');
  const query = useAppQuery({
    queryKey: [...storeKeys(storeId).detail(storeId), 'join-qr'],
    queryFn: ({ signal }) => stores.qr(storeId, signal),
    enabled: allowed,
  });
  return { ...query, allowed };
}
