import type { JalaliInputError, PeriodPreset } from './jalali.types';

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

/** Week starts on Saturday. */
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

export const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'] as const;

export const JALALI_INPUT_MESSAGES: Record<JalaliInputError, string> = {
  empty: 'تاریخ را وارد کنید.',
  format: 'تاریخ را به شکل ۱۴۰۵/۰۷/۰۵ وارد کنید.',
  invalid: 'این تاریخ وجود ندارد.',
};

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
  Today: 'امروز',
  Yesterday: 'دیروز',
  ThisWeek: 'این هفته',
  LastWeek: 'هفته قبل',
  ThisMonth: 'این ماه',
  LastMonth: 'ماه قبل',
  Last7Days: '۷ روز اخیر',
  Last30Days: '۳۰ روز اخیر',
  Last90Days: '۹۰ روز اخیر',
};
