'use client';
import { decimal, marginPercent, type Money, type PricePreview, type PriceRule } from '@dukani/domain';
import { Alert, ListRow, Section } from '@dukani/ui-kit';
import { useEntryPresentation } from '../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

/** Explains the price: markup vs margin, the computed formula, and missing-cost / below-cost warnings. */
export function PricingHelp({
  cost,
  rule,
  preview,
}: {
  cost: Money | null;
  rule: PriceRule;
  preview: PricePreview;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const margin = cost && preview.final ? marginPercent(cost, preview.final) : null;
  return (
    <Section title={t('pricingHelp')}>
      <ListRow>{t('markupMarginHint')}</ListRow>
      {cost && preview.final ? (
        <ListRow>
          {t('pricingFormula', {
            method: rule.method,
            cost: presentation.money(cost, { unit: false }),
            markup: rule.markupPercent ? presentation.qty(rule.markupPercent) : '',
            profit: rule.fixedProfit ? presentation.money(rule.fixedProfit, { unit: false }) : '',
            price: presentation.money(preview.final),
            hasMargin: margin ? 'yes' : 'no',
            margin: presentation.qty(margin ?? decimal.zero),
          })}
        </ListRow>
      ) : null}
      {preview.requiresCost ? (
        <Alert tone="warning" title={t('costUnknown')} description={t('pricingPending')} />
      ) : null}
      {preview.isBelowCost ? <Alert tone="warning" title={t('belowCost')} /> : null}
    </Section>
  );
}
