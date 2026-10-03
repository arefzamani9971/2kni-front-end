import { formatJalali, PERIOD_LABELS } from '@dukani/domain';
import type { DateRangeValue } from './describe-range.types';

export const describeRange = (v: DateRangeValue): string =>
  v.preset !== 'Custom'
    ? PERIOD_LABELS[v.preset]
    : v.range.from === v.range.to
      ? formatJalali(v.range.from)
      : `${formatJalali(v.range.from)} تا ${formatJalali(v.range.to)}`;
