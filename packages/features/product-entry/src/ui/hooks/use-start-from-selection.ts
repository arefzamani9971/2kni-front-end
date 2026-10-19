'use client';
import { useRef, useState } from 'react';
import { useStartEntry } from '../common/hooks/use-start-entry';
import type { SelectionStart } from './use-start-from-selection.types';

/**
 * «بررسی و ادامه» / «ادامه به موجودی» from a chosen catalog item: the typed name and note are persisted first (Back or a
 * refresh keeps them), then the entry starts from the item. One start per action; a failure keeps the screen.
 */
export function useStartFromSelection(bulk: boolean) {
  const { startFromCatalog } = useStartEntry({ bulk });
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const run = async ({ catalogItemId, storeProductId, selection, persist }: SelectionStart) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setFailed(false);
    try {
      if (!(await persist())) throw new Error('DRAFT_SAVE_FAILED');
      await startFromCatalog(catalogItemId, storeProductId, {
        localTitle: selection.localTitle,
        localNote: selection.localNote,
      });
      // a started entry navigates away: the action stays busy until then
    } catch {
      running.current = false;
      setBusy(false);
      setFailed(true);
    }
  };
  return { busy, failed, run };
}
