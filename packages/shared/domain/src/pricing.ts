import { decimal, type DecimalString, type RoundingMode } from './decimal/decimal';
import { money, type Money } from './money/money';

/** Selling-price rule (BIZ-INV-01/02, backend `PriceRule`). Markup percent is not profit margin. */
export type PriceMethod = 'Manual' | 'Markup' | 'FixedProfit';

export type PriceRule = {
  readonly method: PriceMethod;
  readonly manualPrice?: Money | null;
  readonly markupPercent?: DecimalString | null;
  readonly fixedProfit?: Money | null;
  readonly roundingStep?: Money | null;
  readonly roundingDirection?: RoundingMode;
};

export type PricePreview = {
  readonly computed: Money | null;
  readonly final: Money | null;
  readonly isBelowCost: boolean;
  readonly requiresCost: boolean;
};

/**
 * Client-side preview of the selling price (the server recomputes on save):
 * cost 80 + 25% markup = 100; a 25% margin would be 106.67 (F16 acceptance).
 */
export const previewPrice = (cost: Money | null, rule: PriceRule): PricePreview => {
  let computed: Money | null = null;
  if (rule.method === 'Manual') computed = rule.manualPrice ?? null;
  else if (!cost) return { computed: null, final: null, isBelowCost: false, requiresCost: true };
  else if (rule.method === 'Markup' && rule.markupPercent) {
    const factor = decimal.add(decimal.of(1), decimal.div(rule.markupPercent, decimal.of(100), 10));
    computed = money(decimal.round(decimal.mul(cost.amount, factor), 2));
  } else if (rule.method === 'FixedProfit' && rule.fixedProfit) {
    computed = money(decimal.add(cost.amount, rule.fixedProfit.amount));
  }
  if (!computed) return { computed: null, final: null, isBelowCost: false, requiresCost: false };
  const final =
    rule.roundingStep && !decimal.isZero(rule.roundingStep.amount)
      ? money(decimal.roundToStep(computed.amount, rule.roundingStep.amount, rule.roundingDirection ?? 'half-up'))
      : computed;
  const isBelowCost = cost ? decimal.lt(final.amount, cost.amount) : false;
  return { computed, final, isBelowCost, requiresCost: false };
};

/** Profit margin percent of a final price over cost, for display next to the markup. */
export const marginPercent = (cost: Money, price: Money): DecimalString | null =>
  decimal.isZero(price.amount)
    ? null
    : decimal.round(decimal.mul(decimal.div(decimal.sub(price.amount, cost.amount), price.amount, 10), decimal.of(100)), 2);
