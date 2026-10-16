'use client';
import { isAppError, type AppError } from '@dukani/domain';
import { useConfirmAction } from '@dukani/ui-kit';
import { useState } from 'react';
import type { ProfilePatch } from '../../domain/store-profile.types';
import type { StoreProfileEditor } from './use-store-profile-editor.types';
import type { PendingTypeChange } from './use-store-type-change.types';

/**
 * Saves the profile; a new store type is previewed first and confirmed in a dialog (F03 §10). The confirmation is a
 * `useConfirmAction`: the dialog stays open and busy while saving, shows a failure in place, closes on success and
 * cannot run twice (PAT-DELETE-01 / PAT-MODAL-01). A failed preview never commits the patch.
 */
export function useStoreTypeChange(editor: StoreProfileEditor, onDone: () => void) {
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<AppError | null>(null);
  const confirmation = useConfirmAction(async (pending: PendingTypeChange) => {
    await editor.save(pending.patch);
    onDone();
  });

  const saveProfile = async (patch: ProfilePatch) => {
    setPreviewError(null);
    if (patch.storeTypeId && patch.storeTypeId !== editor.store?.storeType.id) {
      setPreviewing(true);
      try {
        confirmation.open({ patch, data: await editor.previewTypeChange(patch.storeTypeId) });
      } catch (error) {
        setPreviewError(isAppError(error) ? error : null);
      } finally {
        setPreviewing(false);
      }
      return;
    }
    try {
      await editor.save(patch);
      onDone();
    } catch {
      // the edit page keeps the values and shows `editor.saveError` (or the conflict) in its banner
    }
  };
  return { confirmation, previewing, previewError, saveProfile };
}
