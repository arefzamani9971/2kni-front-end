'use client';
import { useEffect, useState } from 'react';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { Save } from '../components/NewItemDetails.types';
/** Raw invalid/unfinished fields survive Back and refresh; wire values are written only after validation. */
export function useDraftEditor(
  field: 'stockEditor' | 'pricingEditor',
  value: EntryDraft['stockEditor'] | EntryDraft['pricingEditor'],
  save: Save,
) {
  const snapshot = JSON.stringify(value);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    void save((d) => ({ ...d, [field]: JSON.parse(snapshot) })).catch(() => setFailed(true));
  }, [snapshot, field, save]);
  return failed;
}
