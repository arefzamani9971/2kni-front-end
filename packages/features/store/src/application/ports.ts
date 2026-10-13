import type { OperationId } from '@dukani/domain';
import type { StoreQr } from '../domain/store-qr.types';
import type { ActiveStore } from '@dukani/platform';
import type { StoreDraft } from '../domain/store-draft.types';
import type { BusinessMode, MyStores } from '../domain/store.types';

import type {
  StoreType,
  StoreProfile,
  StorePrivateInfo,
  StoreProfileUpdate,
  StoreTypeChangePreview,
} from '../domain/store-profile-model.types';
export type {
  StoreType,
  StoreProfile,
  StorePrivateInfo,
  StoreTypeChangePreview,
} from '../domain/store-profile-model.types';

export type CreateStoreInput = {
  readonly name: string;
  readonly storeTypeId: string;
  readonly businessMode: BusinessMode | null;
};

/** The store as the gate and the F03 screens read it: the active-store view plus the full profile (one cache entry). */
export type StoreDetail = ActiveStore & { readonly profile: StoreProfile };

/** Port to the Stores module (`/api/v1/stores…`). */
export type StoreRepository = {
  qr(storeId: string, signal?: AbortSignal): Promise<StoreQr>;
  myStores(): Promise<MyStores>;
  storeTypes(): Promise<readonly StoreType[]>;
  /** Idempotent: the same operation id replays the same store. */
  create(input: CreateStoreInput, operationId: OperationId): Promise<StoreDetail>;
  get(storeId: string, signal?: AbortSignal): Promise<StoreDetail>;
  /**
   * Full replace of the public profile (`PUT /profile`). `body.version` is the store version the edit
   * started from; a stale one is 409 `VERSION_CONFLICT` (F03 §12).
   */
  updateProfile(storeId: string, body: StoreProfileUpdate): Promise<StoreDetail>;
  /** Uploads the logo and sets it on the store at once (`POST /logo`); same version rule as the profile. */
  uploadLogo(storeId: string, file: File, expectedVersion: number): Promise<StoreDetail>;
  /** What changing the store type means (`GET …/type-change-preview`); products are never removed (F03 §10). */
  previewTypeChange(
    storeId: string,
    newStoreTypeId: string,
    signal?: AbortSignal,
  ): Promise<StoreTypeChangePreview>;
  /** Owner/bank data; needs `store.settings` (403 otherwise). */
  privateInfo(storeId: string, signal?: AbortSignal): Promise<StorePrivateInfo>;
  /** Full replace of the private owner/bank data (`PUT /private-info`); `body.version` = the version that was read. */
  updatePrivateInfo(storeId: string, body: StorePrivateInfo): Promise<StorePrivateInfo>;
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
