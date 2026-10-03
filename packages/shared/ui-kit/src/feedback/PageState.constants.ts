import type { IconName } from '../icons/Icon.types';
import type { PageStateKind } from './PageState.types';

export const DEFAULTS: Record<
  Exclude<PageStateKind, 'loading'>,
  { icon: IconName; title: string; description: string }
> = {
  empty: { icon: 'list', title: 'هنوز چیزی ثبت نشده', description: '' },
  error: {
    icon: 'alert-danger',
    title: 'دریافت اطلاعات ممکن نشد',
    description: 'اتصال را بررسی کنید و دوباره تلاش کنید.',
  },
  offline: {
    icon: 'offline',
    title: 'اتصال قطع شد',
    description: 'پیش‌نویس‌ها حفظ می‌شوند؛ ثبت نهایی بعد از وصل‌شدن ممکن است.',
  },
  permission: {
    icon: 'alert-warning',
    title: 'اجازه دسترسی ندارید',
    description: 'از مالک فروشگاه بخواهید این دسترسی را به شما بدهد.',
  },
  'not-released': { icon: 'info', title: 'به‌زودی', description: 'این بخش در نسخه‌های بعدی فعال می‌شود.' },
  'unknown-result': {
    icon: 'spinner',
    title: 'در حال بررسی نتیجه',
    description: 'پاسخ نرسید؛ نتیجه همان عملیات را استعلام می‌کنیم و درخواست تازه نمی‌فرستیم.',
  },
  'not-found': {
    icon: 'search',
    title: 'پیدا نشد',
    description: 'این مورد وجود ندارد یا به آن دسترسی ندارید.',
  },
};
