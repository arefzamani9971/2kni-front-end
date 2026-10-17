'use client';
import type { CorrectionReply, CorrectionRequest } from '../../domain/correction.types';
import { useAppMutation, useQueryCache } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useCatalogModule } from '../../module';

type Action =
  { readonly kind: 'reply' | 'appeal'; readonly body: CorrectionReply } | { readonly kind: 'withdraw' };

/**
 * Seller steps on an existing request (F11 §6–7): answer a NeedInfo, appeal a rejection, or withdraw. The server
 * enforces the transitions (INVALID_STATE_TRANSITION); the returned request replaces the cached one.
 */
export function useCorrectionActions(correctionId: string) {
  const { corrections } = useCatalogModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const mutation = useAppMutation<CorrectionRequest, Action>({
    mutationFn: (action) =>
      action.kind === 'withdraw'
        ? corrections.withdraw(store.id, correctionId)
        : action.kind === 'reply'
          ? corrections.reply(store.id, correctionId, action.body)
          : corrections.appeal(store.id, correctionId, action.body),
    onSuccess: (fresh) => cache.set(['catalog', store.id, 'correction', correctionId], fresh),
    invalidates: [
      ['catalog', store.id, 'correction-capabilities'],
      ['products', store.id],
    ],
  });
  return {
    /** Rejects with the AppError; `error` keeps it for the form that shows it beside its fields. */
    run: (action: Action) => mutation.mutateAsync(action),
    pending: mutation.isPending,
    error: mutation.error,
  };
}
