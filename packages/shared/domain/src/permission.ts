/** The 19 independent store permissions of the backend `StorePermission` (BIZ-ACC-02). Owners have all. */
export const PERMISSIONS = [
  'sale.cash',
  'sale.credit',
  'sale.discount',
  'sale.price_override',
  'sale.correct',
  'debt.settle',
  'product.manage',
  'price.change',
  'stock.view',
  'stock.adjust',
  'purchase.manage',
  'purchase.correct',
  'customer.manage',
  'customer.merge',
  'report.financial',
  'data.export',
  'staff.manage',
  'store.settings',
  'order.manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Fallback labels; the live list comes from `GET /api/v1/permissions`. */
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

export const STAFF_DEFAULT_PERMISSIONS: readonly Permission[] = ['sale.cash', 'product.manage', 'customer.manage', 'stock.view'];

export type MemberRole = 'Owner' | 'Staff';

export type AccessContext = { readonly role: MemberRole; readonly permissions: readonly string[] };

export const can = (ctx: AccessContext | null | undefined, permission: Permission): boolean =>
  !!ctx && (ctx.role === 'Owner' || ctx.permissions.includes(permission));

export const isPermission = (value: string): value is Permission => (PERMISSIONS as readonly string[]).includes(value);
