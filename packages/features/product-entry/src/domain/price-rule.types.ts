import type { PriceMethod } from '@dukani/domain';

/** Raw pricing inputs as typed (unfinished values allowed). */
export type PriceInput = {
  readonly method: PriceMethod;
  readonly manualPrice: string;
  readonly markupPercent: string;
  readonly fixedProfit: string;
  readonly roundingStep: string;
  readonly roundingDirection?: string;
};
