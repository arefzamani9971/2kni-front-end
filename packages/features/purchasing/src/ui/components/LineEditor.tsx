'use client';
import { useValidationRules } from '@dukani/forms';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { decimal, todayDateOnly, type DateOnly } from '@dukani/domain';

import {
  Alert,
  Button,
  DateField,
  DecimalField,
  ListRow,
  MoneyField,
  Section,
  SelectField,
} from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { lineSummary } from '../../domain/purchase';
import type { LineDraft } from '../../domain/purchase.types';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { schemaFor } from './LineEditor.schema';

/**
 * «مقدار خرید» + «خلاصهٔ ورود» (Figma 312:9194): unit (base or pack), quantity, cost status and cost,
 * optional production/expiry. Emits a `LineDraft`; the caller decides where it goes.
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

  const units = product.units;
  const packFirst = units.find((u) => !decimal.eq(decimal.of(u.baseQty), decimal.of(1))) ?? units[0];
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schemaFor(product.baseUnitMaxDecimals, t, validationRules),
    defaultValues: {
      unitId: initial?.unitId ?? packFirst?.id ?? '',
      quantity: initial?.quantity ?? '',
      costStatus: initial?.costStatus ?? 'Known',
      unitCost: initial?.unitCost?.amount ?? '',
      productionDate: initial?.productionDate ?? '',
      expiryDate: initial?.expiryDate ?? '',
    },
  });
  const [details, setDetails] = useState(!!(initial?.productionDate || initial?.expiryDate));
  const unit = units.find((u) => u.id === form.watch('unitId')) ?? units[0]!;
  const cost = form.watch('costStatus');
  const rawQty = form.watch('quantity');
  const rawCost = form.watch('unitCost');
  const valid = (x: string) => /^\d+(\.\d+)?$/.test(x);
  const summary = valid(rawQty)
    ? lineSummary({
        quantity: decimal.of(rawQty),
        baseQtyPerUnit: decimal.of(unit.baseQty),
        unitName: unit.name,
        baseUnitName: product.baseUnitName,
        costStatus: cost,
        unitCost: valid(rawCost) ? { amount: decimal.of(rawCost) } : null,
      })
    : null;

  const submit = form.handleSubmit((v) =>
    onSubmit({
      storeProductId: product.id,
      title: product.title,
      baseUnitName: product.baseUnitName,
      unitId: v.unitId,
      unitName: unit.name,
      baseQtyPerUnit: decimal.of(unit.baseQty),
      quantity: v.quantity,
      costStatus: v.costStatus,
      unitCost: v.costStatus === 'Unknown' ? null : v.unitCost,
      productionDate: (v.productionDate as string | null) ?? null,
      expiryDate: (v.expiryDate as string | null) ?? null,
    }),
  );

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
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
                  : `${decimal.of(u.baseQty)} ${product.baseUnitName}`,
              }))}
            />
          )}
        </form.Field>
        <form.Field name="quantity">
          {(f) => (
            <DecimalField
              {...f}
              label={t('quantityOf', { unit: unit.name })}
              required
              maxDecimals={product.baseUnitMaxDecimals}
              unit={unit.name}
            />
          )}
        </form.Field>
        <form.Field name="costStatus">
          {(f) => <SelectField {...f} label={t('costStatus')} required options={presentation.costOptions} />}
        </form.Field>
        {cost !== 'Unknown' ? (
          <form.Field name="unitCost">
            {(f) => <MoneyField {...f} label={t('costOf', { unit: unit.name })} required />}
          </form.Field>
        ) : null}
      </Section>
      {cost === 'Unknown' ? (
        <Alert tone="warning" title={t('costLater')} description={t('unknownCostHint')} />
      ) : null}
      {summary ? (
        <Section title={t('entrySummary')} description={t('factorHistory')}>
          <ListRow>{presentation.digits(summary.conversion)}</ListRow>
          {summary.total ? (
            <ListRow>{t('totalCostLine', { amount: presentation.money(summary.total) })}</ListRow>
          ) : null}
          {summary.perBase ? (
            <ListRow>
              {t('perBaseLine', { unit: product.baseUnitName, amount: presentation.money(summary.perBase) })}
            </ListRow>
          ) : null}
        </Section>
      ) : null}
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
