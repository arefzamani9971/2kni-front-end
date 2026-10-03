import type { Dto } from '@dukani/contracts';

/** Price rule with numeric amounts (internal form of `PriceRuleDto`). */
export type MockPriceRule = Omit<
  Dto<'PriceRuleDto'>,
  'manualPriceAmount' | 'markupPercent' | 'fixedProfitAmount' | 'roundingStepAmount'
> & {
  manualPriceAmount: number | null;
  markupPercent: number | null;
  fixedProfitAmount: number | null;
  roundingStepAmount: number | null;
};
