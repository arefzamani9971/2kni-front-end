import type { Dto } from '@dukani/contracts';
import type { ListFilter, PurchaseStatus } from './purchase.types';

export const LIST_FILTERS: { value: ListFilter; label: string }[] = [
  { value: 'All', label: 'همه' },
  { value: 'Draft', label: 'پیش‌نویس' },
  { value: 'Finalized', label: 'نهایی' },
  { value: 'Corrected', label: 'اصلاح‌شده' },
];

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  Draft: 'ادامه ثبت',
  Finalized: 'نهایی',
  Cancelled: 'ابطال‌شده',
  Discarded: 'دورریخته',
};

export const COST_STATUS_OPTIONS: { value: Dto<'CostStatus'>; label: string; description: string }[] = [
  { value: 'Known', label: 'معلوم', description: 'بر اساس فاکتور خرید' },
  { value: 'Estimated', label: 'تخمینی', description: 'بعداً قابل اصلاح است' },
  { value: 'Unknown', label: 'نامعلوم', description: 'بها را بعداً تکمیل می‌کنم' },
];
