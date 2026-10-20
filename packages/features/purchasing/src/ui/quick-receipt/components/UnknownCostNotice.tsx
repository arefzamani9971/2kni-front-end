'use client';
import { Alert } from '@dukani/ui-kit';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { ReceiptAppForm } from '../types/ReceiptForm.types';

/** An unknown cost is allowed but never shown as zero: the profit of this product waits for the real cost. */
export function UnknownCostNotice({ form }: { form: ReceiptAppForm }) {
  const t = usePurchaseTranslations();
  return (
    <form.Value name="costStatus">
      {(cost) =>
        cost === 'Unknown' ? (
          <Alert tone="warning" title={t('costLater')} description={t('unknownCostHint')} />
        ) : null
      }
    </form.Value>
  );
}
