'use client';
import type { Save } from '../../common/types/use-entry-draft.types';
import { useFieldValue, useValidationRules } from '@dukani/forms';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { useFormAnalytics } from '../../common/hooks/use-form-analytics';

import { decimal, parseDecimalInput } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import {
  Alert,
  Button,
  DecimalField,
  MoneyField,
  PercentField,
  Section,
  SegmentedControl,
  SelectField,
} from '@dukani/ui-kit';
import { baseUnitNameOf, costPerBase, maxDecimalsOf, nextStep, kindOf } from '../../../domain/entry-draft';
import type { EntryDraft, UnitPrice } from '../../../domain/entry-draft.types';
import { salePacksOf, unitPricesOf } from '../../../domain/unit-prices';
import { BackButton } from '../../common/components/BackButton';
import { EntryShell } from '../../common/components/EntryShell';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { createMethods, createRoundingOptions } from '../constants/PricingForm.constants';
import { schema } from '../schemas/PricingForm.schema';
import { useDraftEditor } from '../../common/hooks/use-draft-editor';
import { EntryWorkflow } from '../../common/components/EntryWorkflow';
import { LivePricingHelp } from './LivePricingHelp';
import { PackPrices } from './PackPrices';

export function PricingForm({ draft, save }: { draft: EntryDraft; save: Save }) {
  const t = useEntryTranslations();

  const go = useEntryNav();
  const p = draft.pricing;
  const cost = costPerBase(draft);
  const base = baseUnitNameOf(draft);
  const packs = salePacksOf(draft);
  const saved = unitPricesOf(draft);
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schema(t, validationRules),
    defaultValues: {
      method: p?.method ?? (cost ? 'Markup' : 'Manual'),
      manualPrice: p?.manualPrice?.amount ?? '',
      markupPercent: p?.markupPercent ?? (cost ? '25' : ''),
      fixedProfit: p?.fixedProfit?.amount ?? '',
      roundingStep: p?.roundingStep?.amount ?? '',
      roundingDirection: p?.roundingDirection ?? 'Nearest',
      lowStock: draft.lowStockThreshold ?? '',
      ...draft.pricingEditor,
      // one input per current sale package; a raw or saved price is kept only for the same package
      packPrices: packs.map((u) => ({
        unitKey: u.key,
        price:
          draft.pricingEditor?.packPrices?.find((p) => p.unitKey === u.key)?.price ??
          saved.find((p) => p.unitKey === u.key)?.price.amount ??
          '',
      })),
    },
  });
  useFormAnalytics(form.formState);
  const saveFailed = useDraftEditor(
    form,
    'pricingEditor',
    (v) => ({
      method: v.method,
      manualPrice: v.manualPrice,
      markupPercent: v.markupPercent,
      fixedProfit: v.fixedProfit,
      roundingStep: v.roundingStep,
      roundingDirection: v.roundingDirection ?? 'Nearest',
      lowStock: v.lowStock,
      packPrices: v.packPrices.map((p) => ({ unitKey: p.unitKey, price: p.price ?? '' })),
    }),
    save,
  );
  // the method switches fields; the live price is followed by its own leaves (PackPrices, LivePricingHelp)
  const method = useFieldValue(form, 'method');

  const continueWith = async (
    pricing: EntryDraft['pricing'],
    lowStock: string,
    unitPrices: readonly UnitPrice[] = [],
  ) => {
    const threshold = lowStock.trim()
      ? parseDecimalInput(lowStock, { maxDecimals: maxDecimalsOf(draft) })
      : null;
    if (kindOf(draft) !== 'Service' && threshold && (!threshold.ok || decimal.isNegative(threshold.value))) {
      form.setFieldError('lowStock', t('lowStockInvalid'));
      form.focus('lowStock');
      return;
    }
    const d = await save((x) => ({
      ...x,
      pricing,
      unitPrices,
      lowStockThreshold: kindOf(x) !== 'Service' && threshold?.ok ? threshold.value : null,
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
        roundingDirection: x.roundingDirection,
      },
      x.lowStock,
      packs.flatMap((u, i) => {
        const price = x.packPrices[i]?.price;
        return price ? [{ unitKey: u.key, name: u.name, baseQty: u.baseQty, price }] : [];
      }),
    ),
  );

  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        back={go.back}
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
        {saveFailed ? <Alert tone="danger" title={t('draftSaveFailed')} /> : null}
        <EntryWorkflow current={2} />
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
            <form.Field name="roundingDirection">
              {(f) => (
                <SelectField {...f} label={t('roundingDirection')} options={createRoundingOptions(t)} />
              )}
            </form.Field>
          ) : null}
          {method !== 'Manual' ? (
            <form.Field name="roundingStep">
              {(f) => <MoneyField {...f} label={t('roundMultiple')} optional hint={t('roundExample')} />}
            </form.Field>
          ) : null}
          <PackPrices form={form} packs={packs} cost={cost} />
        </Section>
        <LivePricingHelp form={form} cost={cost} />
        {kindOf(draft) !== 'Service' ? (
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
        ) : null}
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
