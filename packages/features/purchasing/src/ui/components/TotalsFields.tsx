'use client';
import { parseMoneyInput } from '@dukani/domain';
import { MoneyField, Section } from '@dukani/ui-kit';
import { invoiceDifference } from '../../domain/purchase';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import type { TotalsFieldsProps } from '../types/purchase-totals.types';

export function TotalsFields({ form, disabled, computed }: TotalsFieldsProps) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  return (
    <Section>
      <form.Field name="discountAmount">
        {(field) => <MoneyField {...field} disabled={disabled} label={t('totalDiscount')} optional />}
      </form.Field>
      <form.Field name="shippingAmount">
        {(field) => <MoneyField {...field} disabled={disabled} label={t('allocatedShipping')} optional />}
      </form.Field>
      <form.Field name="nonRecoverableTaxAmount">
        {(field) => <MoneyField {...field} disabled={disabled} label={t('nonRecoverableTax')} optional />}
      </form.Field>
      <form.Field name="invoiceTotal">
        {(field) => (
          <MoneyField
            {...field}
            disabled={disabled}
            label={t('supplierInvoiceTotal')}
            optional
            hint={t('checkOnly')}
          />
        )}
      </form.Field>
      {computed ? (
        <form.Value name="invoiceTotal">
          {(value) => {
            const parsed = value ? parseMoneyInput(value) : null;
            const diff = parsed?.ok ? invoiceDifference(computed.totalAmount, parsed.value) : null;
            return (
              <p className="text-body-m text-fg-secondary">
                {t('calculatedTotal')}
                {presentation.toman(computed.totalAmount)}
                {diff
                  ? t('difference', { amount: diff.matches ? t('zero') : presentation.money(diff.diff) })
                  : ''}
              </p>
            );
          }}
        </form.Value>
      ) : null}
    </Section>
  );
}
