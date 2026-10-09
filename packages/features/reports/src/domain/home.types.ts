import type { HOME_ACTION_KINDS } from './home.constants';
import type { Money, DecimalString } from '@dukani/domain';

export type TodayMetrics = {
  readonly sales: Money;
  readonly received: Money;
  readonly lowStockCount: number;
};

export type AttentionItem = { readonly kind: (typeof HOME_ACTION_KINDS)[number]; readonly count: number };

export type WeekBar = { readonly from: string; readonly value: number; readonly amount: DecimalString };
