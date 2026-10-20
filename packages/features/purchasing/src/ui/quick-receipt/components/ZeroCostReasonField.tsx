'use client';
import { useFieldValue } from '@dukani/forms';
import { parseMoneyInput } from '@dukani/domain';
import { TextField } from '@dukani/ui-kit';
import { isKnownZero } from '../../../domain/receipt';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { ReceiptAppForm } from '../types/ReceiptForm.types';

/** Shown only for a known cost of zero (F13 §5): a real gift or free sample needs its reason; nothing else takes one. */
export function ZeroCostReasonField({ form, disabled }: { form: ReceiptAppForm; disabled?: boolean }) {
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
          disabled={disabled}
          maxLength={500}
          placeholder={t('receipt.zeroCostReasonHint')}
        />
      )}
    </form.Field>
  );
}
