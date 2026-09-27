import { formatDecimalFa, fromApiMoney, formatJalali, fromDateOnly, toPersianDigits, WEEKDAYS, weekdayIndex, type Money } from '@dukani/domain';

export type TodayMetrics = { readonly sales: Money; readonly received: Money; readonly lowStockCount: number };

export type AttentionItem = { readonly kind: string; readonly count: number; readonly label: string };

/** Home «نیازمند توجه» rows by backend `ActionKind` (only kinds the seller can act on from the home). */
const ATTENTION_LABELS: Readonly<Record<string, (n: string) => string>> = {
  LowStock: (n) => `${n} کالا نزدیک اتمام`,
  OutOfStock: (n) => `${n} کالا تمام شده`,
  UnknownCost: (n) => `${n} کالا با بهای نامعلوم`,
  NoPrice: (n) => `${n} کالا بدون قیمت فروش`,
  DraftPurchase: (n) => `${n} خرید پیش‌نویس`,
  NearExpiry: (n) => `${n} کالا نزدیک انقضا`,
  OverdueDebt: (n) => `${n} بدهی سررسیدگذشته`,
};

export const attentionItems = (byKind: Readonly<Record<string, number>>): AttentionItem[] =>
  Object.entries(byKind)
    .filter(([kind, count]) => count > 0 && kind in ATTENTION_LABELS)
    .map(([kind, count]) => ({ kind, count, label: ATTENTION_LABELS[kind]!(toPersianDigits(String(count))) }));

export type WeekBar = { readonly label: string; readonly value: number; readonly display: string };

/** Weekly sales bars in thousand toman (Figma «روند فروش / هزار تومان»). */
export const weekBars = (series: readonly { from: string; netRials: number }[]): WeekBar[] =>
  series.map((p) => {
    const thousands = Math.round(p.netRials / 1000);
    return { label: WEEKDAYS[weekdayIndex(fromDateOnly(p.from))]!, value: thousands, display: formatDecimalFa(String(thousands) as never) };
  });

/** «۲۹ شهریور تا ۳ مهر · هزار تومان» */
export const weekCaption = (from: string, to: string): string =>
  `${formatJalali(fromDateOnly(from), 'd MMMM')} تا ${formatJalali(fromDateOnly(to), 'd MMMM')} · هزار تومان`;

export const moneyOrZero = (v: number | null | undefined): Money => fromApiMoney(v ?? 0)!;
