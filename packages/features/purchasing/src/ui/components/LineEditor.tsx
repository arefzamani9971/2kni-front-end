'use client';
import { useFieldValue, useValidationRules } from '@dukani/forms';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { decimal, fitsBaseQuantity, todayDateOnly, type DateOnly } from '@dukani/domain';

import { Alert, Button, DateField, DecimalField, MoneyField, Section, SelectField } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import type { LineDraft } from '../../domain/purchase.types';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { schemaFor } from './LineEditor.schema';
import { LineSummary } from './LineSummary';
import { LineZeroCostReason } from './LineZeroCostReason';

/**
 * «مقدار خرید» + «خلاصهٔ ورود» (Figma 312:9194, purchaseunit 385:8376): unit (base or pack), quantity, cost status
 * and cost, optional production/expiry. Emits a `LineDraft`; the caller decides where it goes. Only active purchase
 * units are offered (F12 §6); a line whose unit was retired or turned sale-only starts without a unit, so the seller
 * chooses again instead of the line moving silently to another unit (AC07).
 */
export function LineEditor({
  product,
  initial,
  submitLabel,
  onSubmit,
  extra,
  busy,
}: {
  product: Dto<'StoreProductDto'>;
  initial?: LineDraft;
  submitLabel: string;
  onSubmit: (line: LineDraft) => void | Promise<void>;
  /** Extra sections rendered between the summary and the submit button (e.g. supplier, date). */
  extra?: ReactNode;
  busy?: boolean;
}) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();

  const units = product.units.filter((u) => u.isPurchasable && !u.archivedAt);
  const staleUnit = !!initial?.unitId && !units.some((u) => u.id === initial.unitId);
  const packFirst = units.find((u) => !decimal.eq(decimal.of(u.baseQty), decimal.of(1))) ?? units[0];
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schemaFor(product.baseUnitMaxDecimals, t, validationRules),
    defaultValues: {
      unitId: staleUnit ? '' : (initial?.unitId ?? packFirst?.id ?? ''),
      quantity: initial?.quantity ?? '',
      costStatus: initial?.costStatus ?? 'Known',
      unitCost: initial?.unitCost?.amount ?? '',
      zeroCostReason: initial?.zeroCostReason ?? '',
      productionDate: initial?.productionDate ?? '',
      expiryDate: initial?.expiryDate ?? '',
    },
  });
  const [details, setDetails] = useState(!!(initial?.productionDate || initial?.expiryDate));
  // discrete choices re-render the editor; typed quantity and cost are followed by the summary leaf only
  const unitId = useFieldValue(form, 'unitId');
  const cost = useFieldValue(form, 'costStatus');
  const unit = units.find((u) => u.id === unitId);
  const unitName = unit?.name ?? t('purchaseUnit');

  const submit = form.handleSubmit((v) => {
    if (!unit) return;
    // the exact base quantity must fit the base unit, as the server checks (F12 §7)
    if (!fitsBaseQuantity(v.quantity, decimal.of(unit.baseQty), product.baseUnitMaxDecimals)) {
      form.setFieldError('quantity', t('quantityBaseInvalid', { unit: product.baseUnitName }));
      form.focus('quantity');
      return;
    }
    return onSubmit({
      storeProductId: product.id,
      title: product.title,
      baseUnitName: product.baseUnitName,
      unitId: unit.id,
      unitName: unit.name,
      baseQtyPerUnit: decimal.of(unit.baseQty),
      quantity: v.quantity,
      costStatus: v.costStatus,
      unitCost: v.costStatus === 'Unknown' ? null : v.unitCost,
      productionDate: (v.productionDate as string | null) ?? null,
      expiryDate: (v.expiryDate as string | null) ?? null,
      zeroCostReason: v.zeroCostReason || null,
    });
  });

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      {staleUnit && !unitId ? (
        <Alert tone="warning" title={t('unitStaleTitle')} description={t('unitStaleHint')} />
      ) : null}
      <Section title={t('quantity')}>
        <form.Field name="unitId">
          {(f) => (
            <SelectField
              {...f}
              label={t('purchaseUnit')}
              required
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
            <DecimalField
              {...f}
              label={t('quantityOf', { unit: unitName })}
              required
              maxDecimals={product.baseUnitMaxDecimals}
              unit={unit?.name}
            />
          )}
        </form.Field>
        <form.Field name="costStatus">
          {(f) => <SelectField {...f} label={t('costStatus')} required options={presentation.costOptions} />}
        </form.Field>
        {cost !== 'Unknown' ? (
          <form.Field name="unitCost">
            {(f) => <MoneyField {...f} label={t('costOf', { unit: unitName })} required />}
          </form.Field>
        ) : null}
        <LineZeroCostReason form={form} />
      </Section>
      {cost === 'Unknown' ? (
        <Alert tone="warning" title={t('costLater')} description={t('unknownCostHint')} />
      ) : null}
      <LineSummary form={form} unit={unit} baseUnitName={product.baseUnitName} />
      {extra}
      {details ? (
        <Section title={t('productionExpiry')}>
          <form.Field name="productionDate">
            {(f) => (
              <DateField
                {...f}
                value={f.value as DateOnly | ''}
                label={t('productionDate')}
                optional
                max={todayDateOnly()}
              />
            )}
          </form.Field>
          <form.Field name="expiryDate">
            {(f) => <DateField {...f} value={f.value as DateOnly | ''} label={t('expiryDate')} optional />}
          </form.Field>
        </Section>
      ) : (
        <Button type="button" variant="secondary" block onClick={() => setDetails(true)}>
          {t('productDatesPrice')}
        </Button>
      )}
      <Button type="submit" block loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
