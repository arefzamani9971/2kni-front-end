'use client';
import { useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { BRAND_NONE, BRAND_UNKNOWN } from '../components/NewItemDetails.constants';
import { schema } from '../components/NewItemDetails.schema';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { useFormAnalytics } from '../common/hooks/use-form-analytics';

/** Details form seeded from the draft; unfinished raw input in `detailsEditor` wins over committed values. */
export function useDetailsForm(draft: EntryDraft) {
  const t = useEntryTranslations();
  const validationRules = useValidationRules();
  const item = draft.newItem!;
  const form = useLocalizedAppForm({
    schema: schema(t, validationRules),
    defaultValues: {
      title: item.title,
      productTypeId: item.productTypeId,
      brand:
        item.brandStatus === 'Known' && item.brandId
          ? item.brandId
          : item.brandStatus === 'None'
            ? BRAND_NONE
            : item.productTypeId
              ? BRAND_UNKNOWN
              : '',
      baseUnitId: item.baseUnitId,
      barcode: item.baseBarcode,
      description: item.description ?? '',
      localTitle: draft.localTitle,
      localNote: draft.localNote ?? '',
      shortcut: draft.shortcut ?? '',
      serviceCost: draft.serviceCost?.amount ?? '',
      netContentValue: item.netContentValue ?? '',
      netContentUnitId: item.netContentUnitId ?? '',
      ...draft.detailsEditor?.fields,
    },
  });
  useFormAnalytics(form.formState);
  return form;
}
