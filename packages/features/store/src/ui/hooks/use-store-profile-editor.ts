'use client';
import { useAppMutation, useAppQuery, useQueryCache } from '@dukani/data';
import { useCan } from '@dukani/platform';
import { useCallback, useState } from 'react';
import type { StoreDetail, StoreProfile, StorePrivateInfo } from '../../application/ports';
import { buildPrivateUpdate } from '../../domain/store-draft';
import type { StorePrivateDraft } from '../../domain/store-draft.types';
import { applyProfilePatch, privateToDraft } from '../../domain/store-profile';
import type { ProfilePatch } from '../../domain/store-profile.types';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';
import { useStore } from './use-store';
import type { PrivateInfoEditor, StoreProfileEditor } from './use-store-profile-editor.types';

const CONFLICT = 'VERSION_CONFLICT';

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
    if (e.code !== CONFLICT) return;
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
      if (!baseline) return false;
      return profile
        .mutateAsync({ base: baseline, patch })
        .then(() => true)
        .catch(() => false);
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

/**
 * Private owner/bank data: read and saved on its own, only with `store.settings` (F03 §2, §7). A 403 or a failure
 * stays inside this section. The values live in memory only — never in a local draft (F02 §7).
 */
export const usePrivateInfoEditor = (storeId: string): PrivateInfoEditor => {
  const { stores } = useStoreModule();
  const allowed = useCan('store.settings');
  const cache = useQueryCache();
  const key = storeKeys(storeId).custom('private-info');
  const query = useAppQuery({
    queryKey: key,
    queryFn: ({ signal }) => stores.privateInfo(storeId, signal),
    enabled: allowed,
    staleTime: 0,
  });
  const [conflict, setConflict] = useState(false);
  // the version of the copy the form was filled from; a background refetch does not move it
  const [base, setBase] = useState<StorePrivateInfo | null>(null);
  if (!base && query.data) setBase(query.data);

  const mutation = useAppMutation({
    mutationFn: ({ value, version }: { value: StorePrivateDraft; version: number | null }) =>
      stores.updatePrivateInfo(storeId, buildPrivateUpdate(value, version)),
    invalidates: [storeKeys(storeId).detail(storeId)], // completion.hasPrivateInfo
    onSuccess: (dto) => {
      setConflict(false);
      cache.set<StorePrivateInfo>(key, dto);
      setBase(dto);
    },
    onError: (e) => {
      if (e.code !== CONFLICT) return;
      setConflict(true);
      void stores
        .privateInfo(storeId)
        .then((fresh) => {
          cache.set<StorePrivateInfo>(key, fresh);
          setBase(fresh);
        })
        .catch(() => undefined);
    },
  });

  return {
    value: base ? privateToDraft(base) : null,
    loadError: allowed ? query.error : null,
    loading: allowed && !base && query.isPending,
    save: async (value) =>
      mutation
        .mutateAsync({ value, version: base?.version ?? null })
        .then(() => true)
        .catch(() => false),
    saving: mutation.isPending,
    saveError: mutation.error,
    conflict,
  };
};
