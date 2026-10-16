'use client';
import { useAppMutation, useQueryCache } from '@dukani/data';
import { appError } from '@dukani/domain';
import { useCallback, useState } from 'react';
import type { StoreDetail, StoreProfile } from '../../application/ports';
import { applyProfilePatch } from '../../domain/store-profile';
import type { ProfilePatch } from '../../domain/store-profile.types';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';
import { useStore } from './use-store';
import type { StoreProfileEditor } from './use-store-profile-editor.types';

import { VERSION_CONFLICT } from './store-editor.constants';

/**
 * F03 public profile editing on an existing store. The baseline is fixed when the screen opens (a background
 * refetch does not move it), so its version really is the copy the user edited: a concurrent change is a 409,
 * never a silent overwrite (F03-S16). Every success — profile or logo — becomes the new baseline.
 */
export const useStoreProfileEditor = (storeId: string): StoreProfileEditor => {
  const { stores } = useStoreModule();
  const query = useStore(storeId);
  const cache = useQueryCache();
  const key = storeKeys(storeId).detail(storeId);
  const [baseline, setBaseline] = useState<StoreProfile | null>(null);
  const [conflict, setConflict] = useState(false);

  // first load fixes the baseline (render-time update, no effect round trip)
  if (!baseline && query.data) setBaseline(query.data.profile);

  const accept = useCallback(
    (detail: StoreDetail) => {
      cache.set(key, detail);
      setBaseline(detail.profile);
    },
    [cache, key],
  );

  const takeLatest = useCallback(async () => {
    const fresh = await stores.get(storeId).catch(() => null);
    if (fresh) accept(fresh);
  }, [stores, storeId, accept]);

  const onError = (e: { code: string }) => {
    if (e.code !== VERSION_CONFLICT) return;
    setConflict(true);
    void takeLatest();
  };

  const profile = useAppMutation({
    mutationFn: ({ base, patch }: { base: StoreProfile; patch: ProfilePatch }) =>
      stores.updateProfile(storeId, applyProfilePatch(base, patch)),
    invalidates: [storeKeys().list()],
    onSuccess: (detail) => {
      setConflict(false);
      accept(detail);
    },
    onError,
  });

  const logo = useAppMutation({
    mutationFn: ({ base, file }: { base: StoreProfile; file: File }) =>
      stores.uploadLogo(storeId, file, base.version),
    invalidates: [storeKeys().list()],
    onSuccess: accept,
    onError,
  });

  const save = useCallback(
    async (patch: ProfilePatch) => {
      if (!baseline) throw appError('Bug', 'STORE_NOT_LOADED', 'The store profile is not loaded yet.');
      await profile.mutateAsync({ base: baseline, patch });
    },
    [baseline, profile],
  );

  const uploadLogo = useCallback(
    async (file: File) => {
      if (!baseline) return false;
      return logo
        .mutateAsync({ base: baseline, file })
        .then(() => true)
        .catch(() => false);
    },
    [baseline, logo],
  );

  return {
    store: baseline,
    loadError: baseline ? null : query.error,
    reload: async () => void (await query.refetch()),
    save,
    saving: profile.isPending,
    saveError: profile.error,
    conflict,
    uploadLogo,
    logoUploading: logo.isPending,
    logoError: logo.error,
    previewTypeChange: (newStoreTypeId) => stores.previewTypeChange(storeId, newStoreTypeId),
  };
};
