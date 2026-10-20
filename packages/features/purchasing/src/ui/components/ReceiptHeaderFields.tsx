'use client';
import { todayDateOnly, type DateOnly } from '@dukani/domain';
import { DateField, MoneyField, Section, TextField } from '@dukani/ui-kit';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import type { ReceiptAppForm } from './ReceiptForm.types';
import { SupplierField } from './SupplierField';

/**
 * The header of one purchase (CPB-06): its own business date (today by default, never in the future), optional
 * supplier and invoice number, and its charges — shipping and a side charge kept apart from any tax, plus the line
 * discount. Nothing here is carried into the next purchase.
 */
export function ReceiptHeaderFields({ form, disabled }: { form: ReceiptAppForm; disabled?: boolean }) {
  const t = usePurchaseTranslations();
  return (
    <>
      <Section title={t('purchaseInvoice')}>
        <form.Field name="documentDate">
          {(f) => (
            <DateField
              {...f}
              value={f.value as DateOnly | ''}
              label={t('purchaseDate')}
              required
              disabled={disabled}
              max={todayDateOnly()}
            />
          )}
        </form.Field>
        <form.Field name="supplierId">
          {(f) => <SupplierField value={f.value} onChange={f.onChange} disabled={disabled} />}
        </form.Field>
        <form.Field name="invoiceNo">
          {(f) => (
            <TextField
              {...f}
              label={t('supplierInvoiceNumber')}
              optional
              disabled={disabled}
              maxLength={64}
              dir="auto"
            />
          )}
        </form.Field>
      </Section>
      <Section title={t('receipt.charges')}>
        <form.Field name="shipping">
          {(f) => <MoneyField {...f} label={t('receipt.shipping')} optional disabled={disabled} />}
        </form.Field>
        <form.Field name="sideCharge">
          {(f) => (
            <MoneyField
              {...f}
              label={t('receipt.sideCharge')}
              optional
              disabled={disabled}
              hint={t('receipt.sideChargeHint')}
            />
          )}
        </form.Field>
        <form.Field name="discount">
          {(f) => <MoneyField {...f} label={t('receipt.discount')} optional disabled={disabled} />}
        </form.Field>
      </Section>
    </>
  );
}
