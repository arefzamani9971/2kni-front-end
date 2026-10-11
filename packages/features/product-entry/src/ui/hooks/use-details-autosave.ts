'use client';
import type { AttributeEditorValues } from '../../domain/attribute-values.types';
import type { EntryDraft } from '../../domain/entry-draft.types';
import type { DetailsCreation, DetailsForm, DetailsScene, Save } from '../components/NewItemDetails.types';
import { useDetailsDraft } from './use-details-draft';

/** Autosaves the raw details input (including unfinished values) so refresh and in-place creation never lose it. */
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
  const { form } = options;
  return useDetailsDraft(
    {
      schemaVersion: options.schemaVersion ?? options.draft.detailsEditor?.schemaVersion ?? null,
      // watched one by one so every edit re-renders and reaches the autosaved raw input
      fields: {
        title: form.watch('title'),
        productTypeId: form.watch('productTypeId'),
        brand: form.watch('brand'),
        baseUnitId: form.watch('baseUnitId'),
        barcode: form.watch('barcode') ?? '',
        description: form.watch('description'),
        localTitle: form.watch('localTitle'),
        localNote: form.watch('localNote'),
        shortcut: form.watch('shortcut'),
        serviceCost: form.watch('serviceCost'),
        netContentValue: form.watch('netContentValue'),
        netContentUnitId: form.watch('netContentUnitId'),
      },
      attributes: options.attributes,
      expanded: options.expanded,
      creation: options.creation,
      scene: options.scene,
    },
    options.save,
  );
}
