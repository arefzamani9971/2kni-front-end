import {
  decimal,
  formatDecimalFa,
  fromApiMoney,
  formatJalali,
  fromDateOnly,
  toPersianDigits,
  WEEKDAYS,
  weekdayIndex,
  type Money,
} from '@dukani/domain';
import type { AttentionItem, WeekBar } from './home.types';
import { ATTENTION_LABELS } from './home.constants';

export const attentionItems = (byKind: Readonly<Record<string, number>>): AttentionItem[] =>
  Object.entries(byKind)
    .filter(([kind, count]) => count > 0 && kind in ATTENTION_LABELS)
    .map(([kind, count]) => ({
      kind,
      count,
      label: ATTENTION_LABELS[kind]!(toPersianDigits(String(count))),
    }));

/** Weekly sales bars in thousand toman (Figma «روند فروش / هزار تومان»). */
export const weekBars = (series: readonly { from: string; netAmount: string | number }[]): WeekBar[] =>
  series.map((p) => {
    const thousands = decimal.round(decimal.div(decimal.of(p.netAmount), decimal.of(1000)), 0);
    // bar height is display-only, so a JS number is fine here; the label keeps the exact decimal
    return {
      label: WEEKDAYS[weekdayIndex(fromDateOnly(p.from))]!,
      value: Number(thousands),
      display: formatDecimalFa(thousands),
    };
  });

/** «۲۹ شهریور تا ۳ مهر · هزار تومان» */
export const weekCaption = (from: string, to: string): string =>
  `${formatJalali(fromDateOnly(from), 'd MMMM')} تا ${formatJalali(fromDateOnly(to), 'd MMMM')} · هزار تومان`;

export const moneyOrZero = (v: string | number | null | undefined): Money => fromApiMoney(v ?? 0)!;
