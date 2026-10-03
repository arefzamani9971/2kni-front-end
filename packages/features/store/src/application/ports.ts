import type { Dto } from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';
import type { ActiveStore } from '@dukani/platform';
import type { StoreDraft } from '../domain/store-draft.types';
import type { BusinessMode, MyStores } from '../domain/store.types';

export type StoreType = { readonly id: string; readonly key: string; readonly name: string };

export type CreateStoreInput = {
  readonly name: string;
  readonly storeTypeId: string;
  readonly businessMode: BusinessMode | null;
};

export type StoreProfile = Dto<'StoreDto'>;

/** Port to the Stores module (`/api/v1/stores…`). */
export type StoreRepository = {
  myStores(): Promise<MyStores>;
  storeTypes(): Promise<readonly StoreType[]>;
  /** Idempotent: the same operation id replays the same store. */
  create(input: CreateStoreInput, operationId: OperationId): Promise<ActiveStore & { readonly profile: StoreProfile }>;
  get(storeId: string, signal?: AbortSignal): Promise<ActiveStore & { readonly profile: StoreProfile }>;
  /** Full replace of the public profile (`PUT /profile`). */
  updateProfile(storeId: string, body: Dto<'UpdateStoreProfileRequest'>): Promise<StoreProfile>;
  /** Uploads the logo and sets it on the store (`POST /logo`). */
  uploadLogo(storeId: string, file: File): Promise<StoreProfile>;
  /** Full replace of the private owner/bank data (`PUT /private-info`). */
  updatePrivateInfo(storeId: string, body: Dto<'StorePrivateInfoDto'>): Promise<Dto<'StorePrivateInfoDto'>>;
};

/**
 * Pending-store draft (F02 §8), keyed by the signed-in user so another account never sees it (F02-S20).
 * Holds no private bank/identity data and no files.
 */
export type StoreDraftRepository = {
  load(): Promise<StoreDraft | null>;
  save(draft: StoreDraft): Promise<void>;
  clear(): Promise<void>;
};
