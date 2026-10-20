'use client';
import { useRef, useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useProductEntryModule } from '../../../module';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { useStartEntry } from '../../common/hooks/use-start-entry';

/** A later stock receipt starts from the committed product, never from newCatalogItem. */
export function useStandaloneCompletion(draft: EntryDraft) {
  const store = useActiveStore();
  const { drafts } = useProductEntryModule();
  const { prepareCatalog } = useStartEntry();
  const go = useEntryNav();
  const active = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const complete = async (stock: boolean) => {
    if (active.current || !draft.result) return;
    active.current = true;
    setBusy(true);
    setError(false);
    try {
      const result = draft.result;
      if (stock) {
        const fresh = await prepareCatalog(result.catalogItemId, result.storeProductId);
        const next = await drafts.save(store.id, { ...fresh, intent: 'compound', stockDecided: false });
        go.step(next.id, 'stock', true);
      } else {
        go.nav.replace(
          draft.purchaseHostId
            ? sellerRoutes.purchases.lines(store.id, draft.purchaseHostId, result.storeProductId)
            : draft.continuousHost
              ? sellerRoutes.purchases.continuous(store.id, result.storeProductId)
              : sellerRoutes.products.list(store.id),
        );
      }
      // Keep the committed draft as a refresh/recovery record. It cannot be submitted again.
    } catch {
      setError(true);
    } finally {
      active.current = false;
      setBusy(false);
    }
  };
  return { busy, error, complete };
}
