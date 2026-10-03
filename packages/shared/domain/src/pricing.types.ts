import type { DecimalString } from './decimal/decimal.types';
import type { RoundingMode } from './decimal/decimal';
import type { Money } from './money/money.types';

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
