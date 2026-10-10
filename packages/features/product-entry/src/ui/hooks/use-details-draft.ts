'use client';
import { useCallback, useEffect, useState } from 'react';
import type { DetailsEditorDraft } from '../../domain/entry-draft.types';
import type { Save } from '../components/NewItemDetails.types';
/** Persist raw input, including unfinished optional values, separately from the validated command. */
export function useDetailsDraft(editor: DetailsEditorDraft, save: Save) {
  const [failed, setFailed] = useState(false);
  const snapshot = JSON.stringify(editor);
  const persist = useCallback(async () => {
    try {
      const result = await save((draft) => ({
        ...draft,
        detailsEditor: JSON.parse(snapshot) as DetailsEditorDraft,
      }));
      setFailed(!result);
      return !!result;
    } catch {
      setFailed(true);
      return false;
    }
  }, [snapshot, save]);
  useEffect(() => {
    void Promise.resolve().then(persist);
  }, [persist]);
  return { failed, persist };
}
