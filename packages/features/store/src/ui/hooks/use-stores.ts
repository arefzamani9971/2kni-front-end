'use client';
import { createQueryKeys, useAppQuery, useFinalCommand } from '@dukani/data';
import type { ActiveStore } from '@dukani/platform';
import type { CreateStoreInput } from '../../application/ports';
import { useStoreModule } from '../../module';

export const storeKeys = createQueryKeys('stores');

export const useMyStores = () => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys().list(), queryFn: () => stores.myStores() });
};

export const useStoreTypes = () => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys().custom('types'), queryFn: () => stores.storeTypes(), staleTime: 60 * 60_000 });
};

export const useStore = (storeId: string) => {
  const { stores } = useStoreModule();
  return useAppQuery({ queryKey: storeKeys(storeId).detail(storeId), queryFn: ({ signal }) => stores.get(storeId, signal), staleTime: 5 * 60_000 });
};

/** POST /api/v1/stores is idempotent (♻): one operation id per «ساخت فروشگاه». */
export const useCreateStore = (onCreated: (store: ActiveStore) => void) => {
  const { stores } = useStoreModule();
  return useFinalCommand<CreateStoreInput, ActiveStore>({
    run: (input, operationId) => stores.create(input, operationId),
    invalidates: [storeKeys().list()],
    onSuccess: (store) => onCreated(store),
  });
};
