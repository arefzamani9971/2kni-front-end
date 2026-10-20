'use client';
import type { Dto } from '@dukani/contracts';
import { MoneyField } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../../i18n/use-purchase-translations';
import type { ReceiptAppForm } from '../types/ReceiptForm.types';

/**
 * Optional explicit new base sale price (BIZ-PUR-08): empty means «بدون تغییر». A value is sent as its own pricing
 * command after the receipt is confirmed; the receipt itself never changes the price.
 */
export function SalePriceField({
  form,
  product,
  disabled,
}: {
  form: ReceiptAppForm;
  product: Dto<'StoreProductDto'>;
  disabled?: boolean;
}) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const current = product.baseSalePriceAmount;
  return (
    <form.Field name="salePrice">
      {(f) => (
        <MoneyField
          {...f}
          label={t('receipt.salePrice', { unit: product.baseUnitName })}
          optional
          disabled={disabled}
          placeholder={t('receipt.salePricePlaceholder')}
          hint={
            current == null
              ? t('receipt.salePriceNone')
              : t('receipt.salePriceHint', { price: presentation.toman(current) })
          }
        />
      )}
    </form.Field>
  );
}
