'use client';
import type { Dto } from '@dukani/contracts';
import { decimal, formatMoney, todayDateOnly, type DateOnly } from '@dukani/domain';
import { rules, s, useAppForm } from '@dukani/forms';
import { Alert, Button, DateField, DecimalField, ListRow, MoneyField, Section, SelectField } from '@dukani/ui-kit';
import { useState, type ReactNode } from 'react';
import { COST_STATUS_OPTIONS, lineSummary, type LineDraft } from '../../domain/purchase';

const schemaFor = (maxDecimals: number) =>
  s
    .object({
      unitId: rules.required('واحد خرید'),
      quantity: rules.quantity(maxDecimals),
      costStatus: s.enum(['Known', 'Estimated', 'Unknown']),
      unitCost: rules.optionalMoney(),
      productionDate: rules.optionalDate(),
      expiryDate: rules.optionalDate(),
    })
    .superRefine((v, ctx) => {
      if (v.costStatus !== 'Unknown' && !v.unitCost)
        ctx.addIssue({ code: 'custom', path: ['unitCost'], message: 'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.' });
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'تاریخ تولید نباید بعد از تاریخ انقضا باشد.' });
    });

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
  const units = product.units;
  const packFirst = units.find((u) => u.baseQty !== 1) ?? units[0];
  const form = useAppForm({
    schema: schemaFor(product.baseUnitMaxDecimals),
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
      <Section title="مقدار خرید">
        <form.Field name="unitId">
          {(f) => (
            <SelectField
              {...f}
              label="واحد خرید"
              required
              options={units.map((u) => ({ value: u.id, label: u.name, description: u.baseQty === 1 ? 'واحد پایه' : `${decimal.of(u.baseQty)} ${product.baseUnitName}` }))}
            />
          )}
        </form.Field>
        <form.Field name="quantity">
          {(f) => <DecimalField {...f} label={`تعداد ${unit.name}`} required maxDecimals={product.baseUnitMaxDecimals} unit={unit.name} />}
        </form.Field>
        <form.Field name="costStatus">{(f) => <SelectField {...f} label="وضعیت بها" required options={COST_STATUS_OPTIONS} />}</form.Field>
        {cost !== 'Unknown' ? <form.Field name="unitCost">{(f) => <MoneyField {...f} label={`بهای هر ${unit.name}`} required />}</form.Field> : null}
      </Section>
      {cost === 'Unknown' ? (
        <Alert tone="warning" title="بها را بعداً تکمیل کنید" description="موجودی ثبت می‌شود؛ سود این کالا تا ثبت بها محاسبه نمی‌شود. بهای نامعلوم، صفر نیست." />
      ) : null}
      {summary ? (
        <Section title="خلاصهٔ ورود" description="ضریب این رسید در سوابق حفظ می‌شود.">
          <ListRow>{summary.conversion}</ListRow>
          {summary.total ? <ListRow>جمع بهای خرید: {formatMoney(summary.total)}</ListRow> : null}
          {summary.perBase ? (
            <ListRow>
              بهای هر {product.baseUnitName} این خرید: {formatMoney(summary.perBase)}
            </ListRow>
          ) : null}
        </Section>
      ) : null}
      {extra}
      {details ? (
        <Section title="تولید و انقضا">
          <form.Field name="productionDate">{(f) => <DateField {...f} value={f.value as DateOnly | ''} label="تاریخ تولید" optional max={todayDateOnly()} />}</form.Field>
          <form.Field name="expiryDate">{(f) => <DateField {...f} value={f.value as DateOnly | ''} label="تاریخ انقضا" optional />}</form.Field>
        </Section>
      ) : (
        <Button type="button" variant="secondary" block onClick={() => setDetails(true)}>
          تولید، انقضا و قیمت تولیدکننده
        </Button>
      )}
      <Button type="submit" block loading={busy}>
        {submitLabel}
      </Button>
    </form>
  );
}
