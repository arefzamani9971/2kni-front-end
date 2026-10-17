import { decimal, type Money, type PriceRule } from '@dukani/domain';
import type { PriceInput } from './price-rule.types';

const moneyOf = (raw: string): Money | null =>
  /^\d+(\.\d+)?$/.test(raw) ? { amount: decimal.of(raw) } : null;

/** The price rule of the live preview; an unfinished amount is simply absent, never zero. */
export const priceRuleOf = (input: PriceInput): PriceRule => ({
  method: input.method,
  manualPrice: moneyOf(input.manualPrice),
  markupPercent: /^\d+(\.\d+)?$/.test(input.markupPercent) ? decimal.of(input.markupPercent) : null,
  fixedProfit: moneyOf(input.fixedProfit),
  roundingStep: moneyOf(input.roundingStep),
  roundingDirection:
    input.roundingDirection === 'Up' ? 'up' : input.roundingDirection === 'Down' ? 'down' : 'half-up',
});
