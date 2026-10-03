import type { Money } from '@dukani/domain';

export type TodayMetrics = {
  readonly sales: Money;
  readonly received: Money;
  readonly lowStockCount: number;
};

export type AttentionItem = { readonly kind: string; readonly count: number; readonly label: string };

export type WeekBar = { readonly label: string; readonly value: number; readonly display: string };
