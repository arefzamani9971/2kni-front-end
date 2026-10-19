'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormAutosave } from '@dukani/forms';
import type { AttributeEditorValues } from '../../../domain/attribute-values.types';
import type { DetailsEditorDraft, EntryDraft } from '../../../domain/entry-draft.types';
import type { DetailsCreation, DetailsForm, DetailsScene } from '../types/NewItemDetails.types';
import type { Save } from '../../common/types/use-entry-draft.types';

/**
 * Autosaves the raw details input (including unfinished values) so refresh and in-place creation never lose it
 * (PAT-FORM-01). The form is followed by a subscription, so typing re-renders the field only; the first change of a
 * burst is saved at once and the rest once. Attributes, the open scene and an in-place creation live outside the
 * form: attributes are reported with `schedule`, the scene and the creation are saved at once. `persist` saves now
 * and tells whether the draft is safe, for the steps that must not lose it (opening a creation, choosing a brand,
 * leaving).
 */
export function useDetailsAutosave(options: {
  readonly form: DetailsForm;
  readonly draft: EntryDraft;
  readonly schemaVersion: number | undefined;
  readonly attributes: AttributeEditorValues;
  readonly expanded: boolean;
  readonly creation: DetailsCreation | null;
  readonly scene: DetailsScene;
  readonly save: Save;
}) {
  const { form, save, attributes, expanded, creation, scene } = options;
  const schemaVersion = options.schemaVersion ?? options.draft.detailsEditor?.schemaVersion ?? null;
  const [failed, setFailed] = useState(false);
  const write = useCallback(
    (editor: DetailsEditorDraft) =>
      save((d) => ({ ...d, detailsEditor: editor })).then(
        (saved) => {
          setFailed(!saved);
          return !!saved;
        },
        () => {
          setFailed(true);
          return false;
        },
      ),
    [save],
  );
  const autosave = useFormAutosave(form, {
    select: (fields): DetailsEditorDraft => ({
      schemaVersion,
      fields: {
        title: fields.title,
        productTypeId: fields.productTypeId,
        brand: fields.brand,
        baseUnitId: fields.baseUnitId,
        barcode: fields.barcode ?? '',
        description: fields.description,
        localTitle: fields.localTitle,
        localNote: fields.localNote,
        shortcut: fields.shortcut,
        serviceCost: fields.serviceCost,
        netContentValue: fields.netContentValue,
        netContentUnitId: fields.netContentUnitId,
      },
      attributes,
      expanded,
      creation,
      scene,
    }),
    save: write,
  });
  const { schedule, flush } = autosave;
  // typing an attribute is a burst; the schema, the open scene and an in-place creation are steps, saved at once so
  // a refresh right after them keeps them (the flush on leaving the page is best effort for an async store)
  useEffect(() => schedule(), [schedule, attributes]);
  useEffect(() => void flush(), [flush, schemaVersion, expanded, creation, scene]);
  return useMemo(() => ({ failed, persist: flush }), [failed, flush]);
}
