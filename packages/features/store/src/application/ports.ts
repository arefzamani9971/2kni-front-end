import type { Dto } from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';
import type { ActiveStore } from '@dukani/platform';
import type { BusinessMode, MyStores } from '../domain/store';

export type StoreType = { readonly id: string; readonly key: string; readonly name: string };

export type CreateStoreInput = { readonly name: string; readonly storeTypeId: string; readonly businessMode: BusinessMode | null };

/** Port to the Stores module (`/api/v1/stores…`). */
export type StoreRepository = {
  myStores(): Promise<MyStores>;
  storeTypes(): Promise<readonly StoreType[]>;
  create(input: CreateStoreInput, operationId: OperationId): Promise<ActiveStore>;
  get(storeId: string, signal?: AbortSignal): Promise<ActiveStore & { readonly profile: Dto<'StoreDto'> }>;
};
