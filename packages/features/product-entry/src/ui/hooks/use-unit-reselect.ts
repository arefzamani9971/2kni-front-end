'use client';
import { useRef, useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { forStockUnitReselection } from '../../domain/stock-unit';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import type { Save } from '../components/StockForm.types';
import { catalogEntryUnits } from './catalog-entry-units';
import { useEntryNav } from './use-entry-nav';

/**
 * «انتخاب دوباره واحد» (F12 §12, AC07): reads the item's units again (catalog drafts), clears the stock unit and
 * opens the stock step, where the seller chooses explicitly. The draft is saved before leaving the review.
 */
export function useUnitReselect(draft: EntryDraft, save: Save) {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const running = useRef(false);
  const [state, setState] = useState<'idle' | 'loading' | 'failed'>('idle');
  const reselect = async () => {
    if (running.current) return;
    running.current = true;
    setState('loading');
    try {
      const choice = draft.catalog;
      const fresh = choice
        ? await Promise.all([
            catalog.catalogItem(store.id, choice.id),
            choice.storeProductId ? catalog.storeProduct(store.id, choice.storeProductId) : null,
          ]).then(([item, existing]) => ({
            units: catalogEntryUnits(item, existing),
            storeProductVersion: existing?.version,
          }))
        : null;
      const saved = await save((d) => forStockUnitReselection(d, fresh));
      if (!saved) throw new Error('DRAFT_SAVE_FAILED');
      setState('idle');
      go.step(saved.id, 'stock');
    } catch {
      setState('failed');
    } finally {
      running.current = false;
    }
  };
  return { reselect, loading: state === 'loading', failed: state === 'failed' };
}
