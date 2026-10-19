'use client';
import { useFieldValue } from '@dukani/forms';
import { ListRow } from '@dukani/ui-kit';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import type { StockAppForm } from '../types/StockForm.types';

/** «۳ بسته × ۲۰ = ۶۰ عدد» for the quantity being typed; only this leaf follows the quantity. */
export function StockConversionPreview({
  form,
  draft,
  unitKey,
}: {
  form: StockAppForm;
  draft: EntryDraft;
  unitKey: string;
}) {
  const presentation = useEntryPresentation();
  const preview = presentation.stockConversion(draft, useFieldValue(form, 'quantity'), unitKey);
  return preview ? <ListRow>{preview}</ListRow> : null;
}
