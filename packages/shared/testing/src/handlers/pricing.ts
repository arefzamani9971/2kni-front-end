import type { Dto } from '@dukani/contracts';

/** Backend `PriceRule.Compute`: markup on cost (not margin), fixed profit, manual; then rounding to a step. */
export const computePrice = (rule: Dto<'PriceRuleDto'>, costPerBase: number | null | undefined): number | null => {
  let price: number | null = null;
  if (rule.method === 'Manual') price = rule.manualPriceRials ?? null;
  else if (costPerBase === null || costPerBase === undefined) return null;
  else if (rule.method === 'Markup' && rule.markupPercent !== null && rule.markupPercent !== undefined)
    price = Math.round(costPerBase * (1 + rule.markupPercent / 100));
  else if (rule.method === 'FixedProfit' && rule.fixedProfitRials !== null && rule.fixedProfitRials !== undefined)
    price = costPerBase + rule.fixedProfitRials;
  if (price === null) return null;
  const step = rule.roundingStepRials ?? 0;
  if (step > 0) {
    const f = rule.roundingDirection === 'Up' ? Math.ceil : rule.roundingDirection === 'Down' ? Math.floor : Math.round;
    price = f(price / step) * step;
  }
  return price;
};

export const pricePreview = (req: Dto<'PricePreviewRequest'>): Dto<'PricePreviewDto'> => {
  const cost = req.costPerBaseRials ?? null;
  const requiresCost = req.pricing.method !== 'Manual' && cost === null;
  const computed = computePrice({ ...req.pricing, roundingStepRials: null }, cost);
  const final = computePrice(req.pricing, cost);
  const pct = (a: number, b: number) => (b === 0 ? null : Math.round(((a - cost!) / b) * 10000) / 100);
  return {
    computedRials: computed,
    finalRials: final,
    marginPercent: final !== null && cost !== null ? pct(final, final) : null,
    markupPercent: final !== null && cost !== null ? pct(final, cost) : null,
    isBelowCost: final !== null && cost !== null && final < cost,
    requiresCost,
  };
};
