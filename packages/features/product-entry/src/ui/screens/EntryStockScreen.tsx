'use client';
import type { Dto } from '@dukani/contracts';
import { decimal, formatDecimalFa, todayDateOnly, type DateOnly } from '@dukani/domain';
import { rules, s, useAppForm } from '@dukani/forms';
import { Alert, Button, DateField, DecimalField, ListRow, MoneyField, PageState, Section, SelectField, TextField } from '@dukani/ui-kit';
import { useState } from 'react';
import {
  baseUnitNameOf,
  conversionText,
  entryUnitsOf,
  maxDecimalsOf,
  nextStep,
  titleOf,
  type EntryDraft,
} from '../../domain/entry-draft';
import { BackButton, EntryShell, MissingDraft } from '../components/EntryShell';
import { useSuppliers } from '../hooks/use-catalog-data';
import { useEntryDraft, useEntryNav } from '../hooks/use-entry';

type Kind = Dto<'PurchaseKind'>;
type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;

/** stock (Figma 312:9170) → opening (312:9236) / new purchase, with cost status (312:9267) and details (358:494). */
export function EntryStockScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  const [kind, setKind] = useState<Kind | null>(null);
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft)
    return (
      <EntryShell title="افزودن موجودی">
        <PageState kind="loading" />
      </EntryShell>
    );
  const chosen = kind ?? draft.stock?.kind ?? null;
  if (!chosen) return <OriginStep draft={draft} onPick={setKind} save={save} />;
  return <StockForm key={chosen} draft={draft} kind={chosen} save={save} onChangeOrigin={() => setKind(null)} />;
}

function OriginStep({ draft, onPick, save }: { draft: EntryDraft; onPick: (k: Kind) => void; save: Save }) {
  const go = useEntryNav();
  const units = entryUnitsOf(draft).filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));
  const base = baseUnitNameOf(draft);
  return (
    <EntryShell title="افزودن موجودی" actions={<BackButton onClick={go.back} />}>
      <Section title="منشأ موجودی">
        <Button variant="secondary" block onClick={() => onPick('Opening')}>
          موجودی از قبل در فروشگاه
        </Button>
        <Button variant="secondary" block onClick={() => onPick('Purchase')}>
          خرید جدید
        </Button>
      </Section>
      <Section title="کالای انتخاب‌شده">
        <ListRow>{titleOf(draft)}</ListRow>
        <ListRow>
          {units.map((u) => `هر ${u.name} = ${formatDecimalFa(u.baseQty)} ${base}`).join(' · ')}
          {units.length ? ' · ' : ''}موجودی بر اساس {base}
        </ListRow>
      </Section>
      <Button
        variant="text"
        block
        onClick={async () => {
          const d = await save((x) => ({ ...x, stock: null, stockDecided: true }));
          if (d) go.step(d.id, nextStep(d, 'stock'));
        }}
      >
        فعلاً بدون موجودی ادامه می‌دهم
      </Button>
    </EntryShell>
  );
}

const COST_OPTIONS: { value: Dto<'CostStatus'>; label: string; description: string }[] = [
  { value: 'Known', label: 'معلوم', description: 'بر اساس فاکتور خرید' },
  { value: 'Estimated', label: 'تخمینی', description: 'بعداً قابل اصلاح است' },
  { value: 'Unknown', label: 'نامعلوم', description: 'بها را بعداً تکمیل می‌کنم' },
];

const schemaFor = (maxDecimals: number) =>
  s
    .object({
      quantity: rules.quantity(maxDecimals),
      unitKey: rules.required('واحد ورود'),
      costStatus: s.enum(['Known', 'Estimated', 'Unknown']),
      unitCost: rules.optionalMoney(),
      supplierId: s.string(),
      invoiceNo: rules.optionalText('شماره فاکتور', 40),
      productionDate: rules.optionalDate(),
      expiryDate: rules.optionalDate(),
    })
    .superRefine((v, ctx) => {
      if (v.costStatus !== 'Unknown' && !v.unitCost)
        ctx.addIssue({ code: 'custom', path: ['unitCost'], message: 'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.' });
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({ code: 'custom', path: ['expiryDate'], message: 'تاریخ تولید نباید بعد از تاریخ انقضا باشد.' });
      if (v.productionDate && v.productionDate > todayDateOnly())
        ctx.addIssue({ code: 'custom', path: ['productionDate'], message: 'تاریخ تولید نمی‌تواند در آینده باشد.' });
    });

function StockForm({ draft, kind, save, onChangeOrigin }: { draft: EntryDraft; kind: Kind; save: Save; onChangeOrigin: () => void }) {
  const go = useEntryNav();
  const suppliers = useSuppliers();
  const units = entryUnitsOf(draft);
  const base = baseUnitNameOf(draft);
  const s0 = draft.stock?.kind === kind ? draft.stock : null;
  const form = useAppForm({
    schema: schemaFor(maxDecimalsOf(draft)),
    defaultValues: {
      quantity: s0?.quantity ?? '',
      unitKey: s0?.unitKey ?? units[0]?.key ?? 'base',
      costStatus: s0?.costStatus ?? 'Known',
      unitCost: s0?.unitCost?.amount ?? '',
      supplierId: s0?.supplierId ?? '',
      invoiceNo: s0?.supplierInvoiceNo ?? '',
      productionDate: s0?.productionDate ?? '',
      expiryDate: s0?.expiryDate ?? '',
    },
  });
  const [details, setDetails] = useState(!!(s0?.productionDate || s0?.expiryDate));
  const cost = form.watch('costStatus');
  const unitKey = form.watch('unitKey');
  const unit = units.find((u) => u.key === unitKey) ?? units[0];
  const quantity = form.watch('quantity');
  const preview = conversionText({
    ...draft,
    stock: quantity ? { kind, unitKey, quantity: decimal.of(quantity.replace(/[^\d.]/g, '') || '0'), costStatus: cost, unitCost: null, supplierId: null, supplierName: null, supplierInvoiceNo: '', productionDate: null, expiryDate: null } : null,
  });

  const submit = form.handleSubmit(async (v) => {
    const supplier = suppliers.data?.find((x) => x.id === v.supplierId);
    const d = await save((x) => ({
      ...x,
      stockDecided: true,
      stock: {
        kind,
        unitKey: v.unitKey,
        quantity: v.quantity,
        costStatus: v.costStatus,
        unitCost: v.costStatus === 'Unknown' ? null : v.unitCost,
        supplierId: kind === 'Purchase' ? (supplier?.id ?? null) : null,
        supplierName: kind === 'Purchase' ? (supplier?.name ?? null) : null,
        supplierInvoiceNo: kind === 'Purchase' ? (v.invoiceNo ?? '') : '',
        productionDate: (v.productionDate as DateOnly | null) ?? null,
        expiryDate: (v.expiryDate as DateOnly | null) ?? null,
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'stock'));
  });

  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title={kind === 'Opening' ? 'موجودی ابتدای کار' : 'خرید جدید'}
        actions={
          <>
            <Button type="submit" block>
              {cost === 'Unknown' ? 'ادامه با بهای نامعلوم' : cost === 'Estimated' ? 'ثبت به‌عنوان تخمینی' : 'ثبت بهای معلوم'}
            </Button>
            <BackButton onClick={onChangeOrigin} label="تغییر منشأ موجودی" />
          </>
        }
      >
        <Section title={kind === 'Opening' ? 'مقدار در فروشگاه' : 'مقدار خرید'}>
          <form.Field name="quantity">{(f) => <DecimalField {...f} label="تعداد" required maxDecimals={maxDecimalsOf(draft)} unit={unit?.name} />}</form.Field>
          <form.Field name="unitKey">
            {(f) => (
              <SelectField
                {...f}
                label="واحد ورود · از کاتالوگ"
                required
                options={units.map((u) => ({
                  value: u.key,
                  label: u.name,
                  description: decimal.eq(u.baseQty, decimal.of(1)) ? 'واحد پایه' : `${formatDecimalFa(u.baseQty)} ${base}`,
                }))}
              />
            )}
          </form.Field>
          {preview ? <ListRow>{preview}</ListRow> : null}
          <form.Field name="costStatus">{(f) => <SelectField {...f} label="وضعیت بها" required options={COST_OPTIONS} />}</form.Field>
          {cost !== 'Unknown' ? (
            <form.Field name="unitCost">{(f) => <MoneyField {...f} label={`بهای هر ${unit?.name ?? base}`} required />}</form.Field>
          ) : null}
        </Section>
        {cost === 'Unknown' ? (
          <Alert
            tone="warning"
            title="بها را بعداً تکمیل کنید"
            description="فروش مجاز است؛ این کالا تا تعیین بها در سود بخش معتبر حساب نمی‌شود. بهای نامعلوم، صفر نیست."
          />
        ) : null}
        {kind === 'Purchase' ? (
          <Section title="فاکتور خرید">
            <form.Field name="supplierId">
              {(f) => (
                <SelectField
                  {...f}
                  label="تأمین‌کننده"
                  optional
                  searchable
                  placeholder="انتخاب تأمین‌کننده"
                  options={(suppliers.data ?? []).map((x) => ({ value: x.id, label: x.name, description: x.phone ?? undefined }))}
                />
              )}
            </form.Field>
            <form.Field name="invoiceNo">{(f) => <TextField {...f} label="شمارهٔ فاکتور تأمین‌کننده" optional maxLength={40} dir="auto" />}</form.Field>
          </Section>
        ) : null}
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
      </EntryShell>
    </form>
  );
}
