import type { Dto } from '@dukani/contracts';

export const FILTER_LABELS = {
  Any: 'همه',
  Low: 'رو به اتمام',
  Out: 'تمام‌شده',
  Unknown: 'بهای نامعلوم',
} as const;

export const COST_LABELS: Record<Dto<'CostStatus'>, string> = {
  Known: 'معلوم',
  Estimated: 'تخمینی',
  Unknown: 'نامعلوم',
};

export const MOVEMENT_LABELS: Record<Dto<'MovementType'>, string> = {
  Opening: 'موجودی اول دوره',
  Purchase: 'خرید',
  Sale: 'فروش',
  Adjustment: 'اصلاح موجودی',
  Count: 'شمارش انبار',
  PurchaseCorrection: 'اصلاح خرید',
  SaleCorrection: 'اصلاح فروش',
  Reversal: 'برگشت',
};
