import type { Dto } from '@dukani/contracts';

export const COST_OPTIONS: { value: Dto<'CostStatus'>; label: string; description: string }[] = [
  { value: 'Known', label: 'معلوم', description: 'بر اساس فاکتور خرید' },
  { value: 'Estimated', label: 'تخمینی', description: 'بعداً قابل اصلاح است' },
  { value: 'Unknown', label: 'نامعلوم', description: 'بها را بعداً تکمیل می‌کنم' },
];
