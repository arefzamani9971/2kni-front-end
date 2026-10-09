import type { AppError } from '@dukani/domain';
import type { StorePrivateDraft } from '../../domain/store-draft.types';
export type PrivateInfoEditor = {
  /** null while loading or when it cannot be read; public pages never depend on it (F03 §7). */
  readonly value: StorePrivateDraft | null;
  readonly loadError: AppError | null;
  readonly loading: boolean;
  readonly save: (value: StorePrivateDraft) => Promise<boolean>;
  readonly saving: boolean;
  readonly saveError: AppError | null;
  readonly conflict: boolean;
};
