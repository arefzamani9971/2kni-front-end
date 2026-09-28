'use client';
import { decimal, formatDecimalFa, formatMoney, marginPercent, moneyOps, previewPrice, type Money } from '@dukani/domain';
import { rules, s, useAppForm } from '@dukani/forms';
import { Alert, Button, DecimalField, ListRow, MoneyField, PercentField, Section, SegmentedControl } from '@dukani/ui-kit';
import { baseUnitNameOf, costPerBase, entryUnitsOf, maxDecimalsOf, nextStep, type EntryDraft, type PriceMethod } from '../../domain/entry-draft';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';

const METHODS: { value: PriceMethod; label: string }[] = [
  { value: 'Manual', label: 'قیمت دستی' },
  { value: 'Markup', label: 'افزوده روی خرید' },
  { value: 'FixedProfit', label: 'سود ثابت' },
];

const schema = s
  .object({
    method: s.enum(['Manual', 'Markup', 'FixedProfit']),
    manualPrice: rules.optionalMoney(),
    markupPercent: s.string(),
    fixedProfit: rules.optionalMoney(),
    roundingStep: rules.optionalMoney(),
    lowStock: s.string(),
  })
  .superRefine((v, ctx) => {
    if (v.method === 'Manual' && (!v.manualPrice || moneyOps.isZero(v.manualPrice)))
      ctx.addIssue({ code: 'custom', path: ['manualPrice'], message: 'قیمت فروش را وارد کنید.' });
    if (v.method === 'Markup' && !/^\d+(\.\d{1,2})?$/.test(v.markupPercent))
      ctx.addIssue({ code: 'custom', path: ['markupPercent'], message: 'درصد افزوده را وارد کنید.' });
    if (v.method === 'FixedProfit' && !v.fixedProfit) ctx.addIssue({ code: 'custom', path: ['fixedProfit'], message: 'سود ثابت را وارد کنید.' });
  });

export function PricingForm({ draft, save }: { draft: EntryDraft; save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null> }) {
  const go = useEntryNav();
  const p = draft.pricing;
  const cost = costPerBase(draft);
  const base = baseUnitNameOf(draft);
  const form = useAppForm({
    schema,
    defaultValues: {
      method: p?.method ?? (cost ? 'Markup' : 'Manual'),
      manualPrice: p?.manualPrice?.amount ?? '',
      markupPercent: p?.markupPercent ?? (cost ? '25' : ''),
      fixedProfit: p?.fixedProfit?.amount ?? '',
      roundingStep: p?.roundingStep?.amount ?? '',
      lowStock: draft.lowStockThreshold ?? '',
    },
  });
  const v = form.watch;
  const method = v('method');
  const moneyOf = (raw: string): Money | null => (/^\d+(\.\d+)?$/.test(raw) ? { amount: decimal.of(raw) } : null);
  const rule = {
    method,
    manualPrice: moneyOf(v('manualPrice')),
    markupPercent: /^\d+(\.\d+)?$/.test(v('markupPercent')) ? decimal.of(v('markupPercent')) : null,
    fixedProfit: moneyOf(v('fixedProfit')),
    roundingStep: moneyOf(v('roundingStep')),
  };
  const preview = previewPrice(cost, rule);
  const packs = entryUnitsOf(draft).filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));

  const continueWith = async (pricing: EntryDraft['pricing'], lowStock: string) => {
    const d = await save((x) => ({ ...x, pricing, lowStockThreshold: lowStock ? decimal.of(lowStock) : null }));
    if (d) go.step(d.id, nextStep(d, 'pricing'));
  };
  const submit = form.handleSubmit((x) =>
    continueWith(
      {
        method: x.method,
        manualPrice: x.method === 'Manual' ? x.manualPrice : null,
        markupPercent: x.method === 'Markup' ? decimal.of(x.markupPercent) : null,
        fixedProfit: x.method === 'FixedProfit' ? x.fixedProfit : null,
        roundingStep: x.method === 'Manual' ? null : x.roundingStep,
      },
      x.lowStock,
    ),
  );

  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title="قیمت فروش"
        actions={
          <>
            <Button type="submit" block>
              ادامه
            </Button>
            <BackButton onClick={go.back} />
          </>
        }
      >
        <Section title="فروش تکی و بسته‌ای">
          <form.Field name="method">{(f) => <SegmentedControl label="روش قیمت‌گذاری" value={f.value} onChange={f.onChange} options={METHODS} />}</form.Field>
          {method === 'Manual' ? (
            <form.Field name="manualPrice">{(f) => <MoneyField {...f} label={`قیمت هر ${base}`} required />}</form.Field>
          ) : null}
          {method === 'Markup' ? (
            <form.Field name="markupPercent">{(f) => <PercentField {...f} label="درصد افزوده روی بهای خرید" required />}</form.Field>
          ) : null}
          {method === 'FixedProfit' ? (
            <form.Field name="fixedProfit">{(f) => <MoneyField {...f} label={`سود ثابت روی هر ${base}`} required />}</form.Field>
          ) : null}
          {method !== 'Manual' ? (
            <form.Field name="roundingStep">{(f) => <MoneyField {...f} label="گرد کردن قیمت به مضرب" optional hint="مثلاً ۵۰۰ یا ۱٬۰۰۰" />}</form.Field>
          ) : null}
          {preview.final
            ? packs.map((u) => (
                <ListRow key={u.key}>
                  قیمت {u.name}: {formatMoney(moneyOps.times(preview.final!, u.baseQty))} (قابل تغییر پس از ثبت)
                </ListRow>
              ))
            : null}
        </Section>
        <Section title="کمک به قیمت‌گذاری">
          <ListRow>افزوده روی قیمت خرید با حاشیه سود متفاوت است.</ListRow>
          {cost && preview.final ? (
            <ListRow>
              خرید {formatMoney(cost, { unit: false })}
              {method === 'Markup' && rule.markupPercent ? ` + افزودهٔ ${formatDecimalFa(rule.markupPercent)}٪` : ''}
              {method === 'FixedProfit' && rule.fixedProfit ? ` + سود ${formatMoney(rule.fixedProfit, { unit: false })}` : ''} = فروش{' '}
              {formatMoney(preview.final)}
              {(() => {
                const m = marginPercent(cost, preview.final!);
                return m ? ` · حاشیه سود ${formatDecimalFa(m)}٪` : '';
              })()}
            </ListRow>
          ) : null}
          {preview.requiresCost ? (
            <Alert tone="warning" title="بهای خرید معلوم نیست" description="قیمت فروش پس از ثبت اولین بهای معلوم محاسبه می‌شود؛ یا قیمت دستی بگذارید." />
          ) : null}
          {preview.isBelowCost ? <Alert tone="warning" title="قیمت فروش کمتر از بهای خرید است" /> : null}
        </Section>
        <form.Field name="lowStock">
          {(f) => <DecimalField {...f} label="هشدار کمبود وقتی موجودی کمتر از" optional unit={base} maxDecimals={maxDecimalsOf(draft)} />}
        </form.Field>
        <Button type="button" variant="text" block onClick={() => continueWith(null, form.getValues().lowStock)}>
          فعلاً بدون قیمت فروش
        </Button>
      </EntryShell>
    </form>
  );
}
