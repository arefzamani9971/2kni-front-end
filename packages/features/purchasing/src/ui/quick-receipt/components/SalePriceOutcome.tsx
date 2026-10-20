'use client';
import { Alert, Button } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { SalePriceState } from '../types/use-sale-price-follow-up.types';

/** The separate result of the explicit sale price; the receipt above it is recorded either way. */
export function SalePriceOutcome({ state, onRetry }: { state: SalePriceState | null; onRetry: () => void }) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  if (!state || state.status === 'running') return null;
  return state.status === 'done' ? (
    <Alert
      tone="success"
      title={t('receipt.priceUpdated', { title: state.title, price: presentation.money(state.amount) })}
    />
  ) : (
    <Alert
      tone="warning"
      title={t('receipt.priceFailed')}
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          {t('receipt.priceRetry')}
        </Button>
      }
    />
  );
}
