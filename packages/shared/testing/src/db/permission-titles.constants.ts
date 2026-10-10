import type { Permission } from '@dukani/domain';

/** Titles the mock `GET /api/v1/permissions` returns; the real list and wording come from the backend. */
export const PERMISSION_TITLES: Record<Permission, string> = {
  'sale.cash': 'فروش نقدی',
  'sale.credit': 'فروش نسیه',
  'sale.discount': 'تخفیف در فروش',
  'sale.price_override': 'تغییر قیمت هنگام فروش',
  'sale.correct': 'اصلاح و ابطال فاکتور',
  'debt.settle': 'ثبت تسویهٔ بدهی',
  'product.manage': 'ثبت و ویرایش کالا',
  'price.change': 'تغییر قیمت کالا',
  'stock.view': 'مشاهدهٔ موجودی',
  'stock.adjust': 'تعدیل موجودی',
  'purchase.manage': 'ثبت خرید',
  'purchase.correct': 'اصلاح و ابطال خرید',
  'customer.manage': 'ثبت و ویرایش مشتری',
  'customer.merge': 'ادغام مشتری',
  'report.financial': 'گزارش‌های مالی',
  'data.export': 'خروجی اطلاعات',
  'staff.manage': 'مدیریت کارکنان',
  'store.settings': 'تنظیمات فروشگاه',
  'order.manage': 'مدیریت سفارش‌های مشتریان',
};
