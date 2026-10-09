'use client';
import { useAppMutation, useAppQuery, useQueryCache } from '@dukani/data';
import { useCan } from '@dukani/platform';
import { useState } from 'react';
import type { StorePrivateInfo } from '../../application/ports';
import { buildPrivateUpdate } from '../../domain/store-draft';
import type { StorePrivateDraft } from '../../domain/store-draft.types';
import { privateToDraft } from '../../domain/store-profile';
import { useStoreModule } from '../../module';
import { storeKeys } from './store-keys';
import { VERSION_CONFLICT } from './store-editor.constants';
import type { PrivateInfoEditor } from './use-private-info-editor.types';
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
      if (e.code !== VERSION_CONFLICT) return;
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
