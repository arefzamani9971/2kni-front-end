'use client';
import { useFieldValue } from '@dukani/forms';
import { previewPrice, type Money } from '@dukani/domain';
import { priceRuleOf } from '../../domain/price-rule';
import type { PricingAppForm } from '../components/PricingForm.types';

/**
 * The live sale price of the pricing step. Only the leaves that show it subscribe to the price inputs, so typing a
 * price does not re-render the step (PAT-FORM-01).
 */
export function usePricePreview(form: PricingAppForm, cost: Money | null) {
  const rule = priceRuleOf({
    method: useFieldValue(form, 'method'),
    manualPrice: useFieldValue(form, 'manualPrice'),
    markupPercent: useFieldValue(form, 'markupPercent'),
    fixedProfit: useFieldValue(form, 'fixedProfit'),
    roundingStep: useFieldValue(form, 'roundingStep'),
    roundingDirection: useFieldValue(form, 'roundingDirection'),
  });
  return { rule, preview: previewPrice(cost, rule) };
}
