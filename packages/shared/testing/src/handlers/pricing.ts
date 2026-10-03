import type { Dto } from '@dukani/contracts';
import { fromRuleDto, num, str } from '../db/wire';
import type { MockPriceRule } from '../db/wire.types';

/** Money is kept to two fraction digits, like the backend numeric(18,2) (BIZ-MNY-01). */
const round2 = (v: number) => Math.round(v * 100) / 100;

/** Backend `PriceRule.Compute`: markup on cost (not margin), fixed profit, manual; then rounding to a step. */
export const computePrice = (rule: MockPriceRule, costPerBase: number | null | undefined): number | null => {
  let price: number | null = null;
  if (rule.method === 'Manual') price = rule.manualPriceAmount;
  else if (costPerBase === null || costPerBase === undefined) return null;
  else if (rule.method === 'Markup' && rule.markupPercent !== null)
    price = round2(costPerBase * (1 + rule.markupPercent / 100));
  else if (rule.method === 'FixedProfit' && rule.fixedProfitAmount !== null)
    price = costPerBase + rule.fixedProfitAmount;
  if (price === null) return null;
  const step = rule.roundingStepAmount ?? 0;
  if (step > 0) {
    const f =
      rule.roundingDirection === 'Up'
        ? Math.ceil
        : rule.roundingDirection === 'Down'
          ? Math.floor
          : Math.round;
    price = f(price / step) * step;
  }
  return price;
};

export const pricePreview = (req: Dto<'PricePreviewRequest'>): Dto<'PricePreviewDto'> => {
  const cost = num(req.costPerBaseAmount);
  const rule = fromRuleDto(req.pricing);
  const requiresCost = rule.method !== 'Manual' && cost === null;
  const computed = computePrice({ ...rule, roundingStepAmount: null }, cost);
  const final = computePrice(rule, cost);
  const pct = (a: number, b: number) => (b === 0 ? null : Math.round(((a - cost!) / b) * 10000) / 100);
  return {
    computedAmount: str(computed),
    finalAmount: str(final),
    marginPercent: str(final !== null && cost !== null ? pct(final, final) : null),
    markupPercent: str(final !== null && cost !== null ? pct(final, cost) : null),
    isBelowCost: final !== null && cost !== null && final < cost,
    requiresCost,
  };
};
