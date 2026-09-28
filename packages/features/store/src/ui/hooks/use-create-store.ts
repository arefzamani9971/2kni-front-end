'use client';
import { useFinalCommand } from '@dukani/data';
import type { ActiveStore } from '@dukani/platform';
import type { CreateStoreInput } from '../../application/ports';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';

/** POST /api/v1/stores is idempotent (♻): one operation id per «ساخت فروشگاه». */
export const useCreateStore = (onCreated: (store: ActiveStore) => void) => {
  const { stores } = useStoreModule();
  return useFinalCommand<CreateStoreInput, ActiveStore>({
    run: (input, operationId) => stores.create(input, operationId),
    invalidates: [storeKeys().list()],
    onSuccess: (store) => onCreated(store),
  });
};
