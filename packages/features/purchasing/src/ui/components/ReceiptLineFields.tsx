'use client';
import { decimal, todayDateOnly, type DateOnly } from '@dukani/domain';
import { Alert, Button, DateField, DecimalField, MoneyField, Section, SelectField } from '@dukani/ui-kit';
import { useState } from 'react';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import type { ReceiptSectionProps } from './ReceiptForm.types';
import { ReceiptUnitName } from './ReceiptUnitName';
import { UnknownCostNotice } from './UnknownCostNotice';
import { ZeroCostReasonField } from './ZeroCostReasonField';

/**
 * «مقدار و بها» of one receipt: entry unit (active purchase units only, F12 §6), quantity, cost state and cost of
 * the chosen unit, the zero-cost reason when it applies, and optional production/expiry dates. Typing re-renders
 * only the field; the dependent notes are their own leaves.
 */
export function ReceiptLineFields({ form, product, kind, disabled }: ReceiptSectionProps) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const units = product.units.filter((u) => u.isPurchasable && !u.archivedAt);
  const [details, setDetails] = useState(() => {
    const v = form.getValues();
    return !!(v.productionDate || v.expiryDate);
  });
  if (units.length === 0) return <Alert tone="warning" title={t('receipt.noPurchaseUnit')} />;
  return (
    <>
      <Section title={kind === 'Opening' ? t('receipt.lineTitle') : t('quantity')}>
        <form.Field name="unitId">
          {(f) => (
            <SelectField
              {...f}
              label={t('receipt.unit')}
              required
              disabled={disabled}
              options={units.map((u) => ({
                value: u.id,
                label: u.name,
                description: decimal.eq(decimal.of(u.baseQty), decimal.of(1))
                  ? t('baseUnit')
                  : `${presentation.qty(u.baseQty)} ${product.baseUnitName}`,
              }))}
            />
          )}
        </form.Field>
        <form.Field name="quantity">
          {(f) => (
            <ReceiptUnitName form={form} product={product}>
              {(unit) => (
                <DecimalField
                  {...f}
                  label={t('quantityOf', { unit: unit ?? t('purchaseUnit') })}
                  required
                  disabled={disabled}
                  maxDecimals={product.baseUnitMaxDecimals}
                  unit={unit ?? undefined}
                />
              )}
            </ReceiptUnitName>
          )}
        </form.Field>
        <form.Field name="costStatus">
          {(f) => (
            <SelectField
              {...f}
              label={t('costStatus')}
              required
              disabled={disabled}
              options={presentation.costOptions}
            />
          )}
        </form.Field>
        <form.Value name="costStatus">
          {(cost) =>
            cost === 'Unknown' ? null : (
              <form.Field name="unitCost">
                {(f) => (
                  <ReceiptUnitName form={form} product={product}>
                    {(unit) => (
                      <MoneyField
                        {...f}
                        label={t('costOf', { unit: unit ?? t('purchaseUnit') })}
                        required
                        disabled={disabled}
                      />
                    )}
                  </ReceiptUnitName>
                )}
              </form.Field>
            )
          }
        </form.Value>
        <ZeroCostReasonField form={form} disabled={disabled} />
      </Section>
      <UnknownCostNotice form={form} />
      {details ? (
        <Section title={t('productionExpiry')}>
          <form.Field name="productionDate">
            {(f) => (
              <DateField
                {...f}
                value={f.value as DateOnly | ''}
                label={t('productionDate')}
                optional
                disabled={disabled}
                max={todayDateOnly()}
              />
            )}
          </form.Field>
          <form.Field name="expiryDate">
            {(f) => (
              <DateField
                {...f}
                value={f.value as DateOnly | ''}
                label={t('expiryDate')}
                optional
                disabled={disabled}
              />
            )}
          </form.Field>
        </Section>
      ) : (
        <Button type="button" variant="secondary" block disabled={disabled} onClick={() => setDetails(true)}>
          {t('productionExpiry')}
        </Button>
      )}
    </>
  );
}
