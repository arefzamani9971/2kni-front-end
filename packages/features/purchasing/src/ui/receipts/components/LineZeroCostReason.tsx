'use client';
import { parseMoneyInput } from '@dukani/domain';
import { useFieldValue } from '@dukani/forms';
import { TextField } from '@dukani/ui-kit';
import { isKnownZero } from '../../../domain/receipt';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { LineAppForm } from '../types/LineEditor.types';

/** The zero-cost reason of a receipt-draft line (F13 §5): only a known cost of zero takes one. */
export function LineZeroCostReason({ form }: { form: LineAppForm }) {
  const t = usePurchaseTranslations();
  const cost = useFieldValue(form, 'costStatus');
  const raw = useFieldValue(form, 'unitCost');
  const parsed = parseMoneyInput(raw || '');
  if (!isKnownZero(cost, parsed.ok ? parsed.value : null)) return null;
  return (
    <form.Field name="zeroCostReason">
      {(f) => (
        <TextField
          {...f}
          label={t('receipt.zeroCostReason')}
          required
          maxLength={500}
          placeholder={t('receipt.zeroCostReasonHint')}
        />
      )}
    </form.Field>
  );
}
