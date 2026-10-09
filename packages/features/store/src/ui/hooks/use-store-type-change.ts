'use client';
import { isAppError, type AppError } from '@dukani/domain';
import { useState } from 'react';
import type { ProfilePatch } from '../../domain/store-profile.types';
import type { StoreProfileEditor } from './use-store-profile-editor.types';
import type { PendingTypeChange } from './use-store-type-change.types';
/** Preview a type change before saving; failed previews never commit the patch. */
export function useStoreTypeChange(editor: StoreProfileEditor, onDone: () => void) {
  const [preview, setPreview] = useState<PendingTypeChange | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<AppError | null>(null);
  const commit = async (patch: ProfilePatch) => {
    if (await editor.save(patch)) onDone();
  };
  const saveProfile = async (patch: ProfilePatch) => {
    setPreviewError(null);
    if (patch.storeTypeId && patch.storeTypeId !== editor.store?.storeType.id) {
      setPreviewing(true);
      try {
        setPreview({ patch, data: await editor.previewTypeChange(patch.storeTypeId) });
      } catch (error) {
        setPreviewError(isAppError(error) ? error : null);
      } finally {
        setPreviewing(false);
      }
      return;
    }
    await commit(patch);
  };
  return { preview, setPreview, previewing, previewError, commit, saveProfile };
}
