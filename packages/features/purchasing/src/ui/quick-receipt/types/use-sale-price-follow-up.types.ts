import type { Money } from '@dukani/domain';

/** An explicit base sale price to set once its receipt is confirmed. */
export type SalePricePlan = {
  readonly productId: string;
  readonly title: string;
  readonly amount: Money;
};

export type SalePriceState = SalePricePlan & { readonly status: 'running' | 'done' | 'failed' };
