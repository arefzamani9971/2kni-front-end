'use client';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, ButtonLink } from '@dukani/ui-kit';
import type { RecordedReceipt } from '../../../domain/receipt.types';
import { usePurchasePresentation } from '../../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';

/**
 * The short confirmation of the previous turn, shown above the fresh form (no intermediate success page): the
 * receipt is recorded and stays viewable on its own page.
 */
export function RecordedReceiptBanner({ receipt }: { receipt: RecordedReceipt | null }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const store = useActiveStore();
  if (!receipt) return null;
  return (
    <Alert
      tone="success"
      title={t('continuous.recorded', {
        title: receipt.title,
        number: receipt.number == null ? '—' : presentation.qty(receipt.number),
      })}
      action={
        <ButtonLink size="sm" variant="secondary" href={sellerRoutes.purchases.detail(store.id, receipt.id)}>
          {t('continuous.viewReceipt')}
        </ButtonLink>
      }
    />
  );
}
