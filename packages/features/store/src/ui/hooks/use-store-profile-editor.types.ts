import type { AppError } from '@dukani/domain';
import type { StoreProfile, StoreTypeChangePreview } from '../../application/ports';
import type { ProfilePatch } from '../../domain/store-profile.types';

export type StoreProfileEditor = {
  /** The baseline every save is merged onto (its version is the `expectedVersion`); null while loading. */
  readonly store: StoreProfile | null;
  readonly loadError: AppError | null;
  readonly reload: () => Promise<void>;
  /**
   * Merges the patch onto the baseline and sends the full profile; rejects with the `AppError` when it was not saved
   * (also kept in `saveError`), so a confirmation can stay open on failure.
   */
  readonly save: (patch: ProfilePatch) => Promise<void>;
  readonly saving: boolean;
  readonly saveError: AppError | null;
  /**
   * true after a 409: the baseline was replaced by the latest store and the user's values are still in the form;
   * saving again applies them on the new version (F03 §12, reconfirmation).
   */
  readonly conflict: boolean;
  /** Uploads at once (the server switches the logo immediately); the baseline follows the new version (F03 §9). */
  readonly uploadLogo: (file: File) => Promise<boolean>;
  readonly logoUploading: boolean;
  readonly logoError: AppError | null;
  readonly previewTypeChange: (newStoreTypeId: string) => Promise<StoreTypeChangePreview>;
};

export type { PrivateInfoEditor } from './use-private-info-editor.types';
