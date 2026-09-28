import { PERIOD_LABELS, formatJalali, type DateRange, type PeriodPreset } from '@dukani/domain';

export type DateRangeValue = { preset: PeriodPreset | 'Custom'; range: DateRange };

export const describeRange = (v: DateRangeValue): string =>
  v.preset !== 'Custom'
    ? PERIOD_LABELS[v.preset]
    : v.range.from === v.range.to
      ? formatJalali(v.range.from)
      : `${formatJalali(v.range.from)} تا ${formatJalali(v.range.to)}`;
