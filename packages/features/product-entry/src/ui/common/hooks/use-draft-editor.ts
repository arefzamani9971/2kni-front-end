'use client';
import { useCallback, useState } from 'react';
import { useFormAutosave, type AppForm } from '@dukani/forms';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import type { Save } from '../types/use-entry-draft.types';

import type { EditorField } from '../types/use-draft-editor.types';

/**
 * Raw invalid/unfinished fields of a step survive Back and refresh; wire values are written only after validation.
 * The form is followed by `useFormAutosave` (PAT-FORM-01): typing re-renders the field only, the first change of a
 * burst is saved at once and the rest once, pending input is flushed on unmount and when the page is left.
 * Returns whether the latest write failed.
 */
export function useDraftEditor<TIn, TOut, K extends EditorField>(
  form: AppForm<TIn, TOut>,
  field: K,
  select: (values: TIn) => NonNullable<EntryDraft[K]>,
  save: Save,
) {
  const [failed, setFailed] = useState(false);
  const write = useCallback(
    (editor: NonNullable<EntryDraft[K]>) =>
      save((d) => ({ ...d, [field]: editor })).then(
        (saved) => {
          setFailed(!saved);
          return !!saved;
        },
        () => {
          setFailed(true);
          return false;
        },
      ),
    [save, field],
  );
  useFormAutosave(form, { select, save: write });
  return failed;
}
