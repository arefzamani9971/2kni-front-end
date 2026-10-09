'use client';
import { useValidationRules } from '@dukani/forms';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal, marginPercent, moneyOps, previewPrice, type Money } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import {
  Alert,
  Button,
  DecimalField,
  ListRow,
  MoneyField,
  PercentField,
  Section,
  SegmentedControl,
} from '@dukani/ui-kit';
import { baseUnitNameOf, costPerBase, entryUnitsOf, maxDecimalsOf, nextStep } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { createMethods } from './PricingForm.constants';
import { schema } from './PricingForm.schema';

export function PricingForm({
  draft,
  save,
}: {
  draft: EntryDraft;
  save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const go = useEntryNav();
  const p = draft.pricing;
  const cost = costPerBase(draft);
  const base = baseUnitNameOf(draft);
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schema(t, validationRules),
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
  const moneyOf = (raw: string): Money | null =>
    /^\d+(\.\d+)?$/.test(raw) ? { amount: decimal.of(raw) } : null;
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
    const d = await save((x) => ({
      ...x,
      pricing,
      lowStockThreshold: lowStock ? decimal.of(lowStock) : null,
    }));
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
        title={t('salePrice')}
        actions={
          <>
            <Button type="submit" block>
              {t('continue')}
            </Button>
            <BackButton onClick={go.back} />
          </>
        }
      >
        <Section title={t('singlePackSales')}>
          <form.Field name="method">
            {(f) => (
              <SegmentedControl
                label={t('pricingMethod')}
                value={f.value}
                onChange={f.onChange}
                options={createMethods(t)}
              />
            )}
          </form.Field>
          {method === 'Manual' ? (
            <form.Field name="manualPrice">
              {(f) => <MoneyField {...f} label={t('pricePer', { unit: base })} required />}
            </form.Field>
          ) : null}
          {method === 'Markup' ? (
            <form.Field name="markupPercent">
              {(f) => <PercentField {...f} label={t('markupPercent')} required />}
            </form.Field>
          ) : null}
          {method === 'FixedProfit' ? (
            <form.Field name="fixedProfit">
              {(f) => <MoneyField {...f} label={t('profitPer', { unit: base })} required />}
            </form.Field>
          ) : null}
          {method !== 'Manual' ? (
            <form.Field name="roundingStep">
              {(f) => <MoneyField {...f} label={t('roundMultiple')} optional hint={t('roundExample')} />}
            </form.Field>
          ) : null}
          {preview.final
            ? packs.map((u) => (
                <ListRow key={u.key}>
                  {t('packPrice', {
                    unit: u.name,
                    amount: presentation.money(moneyOps.times(preview.final!, u.baseQty)),
                  })}
                </ListRow>
              ))
            : null}
        </Section>
        <Section title={t('pricingHelp')}>
          <ListRow>{t('markupMarginHint')}</ListRow>
          {cost && preview.final ? (
            <ListRow>
              {t('pricingFormula', {
                method,
                cost: presentation.money(cost, { unit: false }),
                markup: rule.markupPercent ? presentation.qty(rule.markupPercent) : '',
                profit: rule.fixedProfit ? presentation.money(rule.fixedProfit, { unit: false }) : '',
                price: presentation.money(preview.final),
                hasMargin: marginPercent(cost, preview.final) ? 'yes' : 'no',
                margin: presentation.qty(marginPercent(cost, preview.final) ?? decimal.zero),
              })}
            </ListRow>
          ) : null}
          {preview.requiresCost ? (
            <Alert tone="warning" title={t('costUnknown')} description={t('pricingPending')} />
          ) : null}
          {preview.isBelowCost ? <Alert tone="warning" title={t('belowCost')} /> : null}
        </Section>
        <form.Field name="lowStock">
          {(f) => (
            <DecimalField
              {...f}
              label={t('lowStockThreshold')}
              optional
              unit={base}
              maxDecimals={maxDecimalsOf(draft)}
            />
          )}
        </form.Field>
        <Button
          type="button"
          variant="text"
          block
          onClick={() => continueWith(null, form.getValues().lowStock)}
        >
          {t('withoutPrice')}
        </Button>
      </EntryShell>
    </form>
  );
}
