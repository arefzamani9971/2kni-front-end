import { LIST_FILTER_VALUES } from './list-filter.constants';
import type { ListFilter, PurchaseStatus } from './purchase.types';

/** Legacy Persian projection; live UI uses its localized presentation catalog. */
export const LIST_FILTERS: { value: ListFilter; label: string }[] = LIST_FILTER_VALUES.map((value) => ({
  value,
  label: { All: 'همه', Draft: 'پیش‌نویس', Finalized: 'نهایی', Corrected: 'اصلاح‌شده' }[value],
}));

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  Draft: 'ادامه ثبت',
  Finalized: 'نهایی',
  Cancelled: 'ابطال‌شده',
  Discarded: 'دورریخته',
};
