'use client';
import { sellerRoutes } from '@dukani/routes';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useEntryNav } from '../../common/hooks/use-entry-nav';

export function useDetailsBack(draft: EntryDraft, persist: () => Promise<unknown>) {
  const go = useEntryNav();
  return async () => {
    if (!(await persist())) return;
    if (draft.purchaseHostId) go.nav.replace(sellerRoutes.purchases.lines(go.storeId, draft.purchaseHostId));
    else if (draft.continuousHost) go.nav.replace(sellerRoutes.purchases.continuous(go.storeId));
    else if (draft.intent === 'standalone') go.nav.replace(sellerRoutes.products.list(go.storeId));
    else go.back();
  };
}
