/** Home «نیازمند توجه» rows by backend `ActionKind` (only kinds the seller can act on from the home). */
export const ATTENTION_LABELS: Readonly<Record<string, (n: string) => string>> = {
  LowStock: (n) => `${n} کالا نزدیک اتمام`,
  OutOfStock: (n) => `${n} کالا تمام شده`,
  UnknownCost: (n) => `${n} کالا با بهای نامعلوم`,
  NoPrice: (n) => `${n} کالا بدون قیمت فروش`,
  DraftPurchase: (n) => `${n} خرید پیش‌نویس`,
  NearExpiry: (n) => `${n} کالا نزدیک انقضا`,
  OverdueDebt: (n) => `${n} بدهی سررسیدگذشته`,
};
