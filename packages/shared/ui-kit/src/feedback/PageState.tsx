import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';
import { Skeleton } from '../primitives/Skeleton';
import { Spinner } from '../primitives/Spinner';

export type PageStateKind = 'loading' | 'empty' | 'error' | 'offline' | 'permission' | 'not-released' | 'unknown-result' | 'not-found';

const DEFAULTS: Record<Exclude<PageStateKind, 'loading'>, { icon: IconName; title: string; description: string }> = {
  empty: { icon: 'list', title: 'هنوز چیزی ثبت نشده', description: '' },
  error: { icon: 'alert-danger', title: 'دریافت اطلاعات ممکن نشد', description: 'اتصال را بررسی کنید و دوباره تلاش کنید.' },
  offline: { icon: 'offline', title: 'اتصال قطع شد', description: 'پیش‌نویس‌ها حفظ می‌شوند؛ ثبت نهایی بعد از وصل‌شدن ممکن است.' },
  permission: { icon: 'alert-warning', title: 'اجازه دسترسی ندارید', description: 'از مالک فروشگاه بخواهید این دسترسی را به شما بدهد.' },
  'not-released': { icon: 'info', title: 'به‌زودی', description: 'این بخش در نسخه‌های بعدی فعال می‌شود.' },
  'unknown-result': { icon: 'spinner', title: 'در حال بررسی نتیجه', description: 'پاسخ نرسید؛ نتیجه همان عملیات را استعلام می‌کنیم و درخواست تازه نمی‌فرستیم.' },
  'not-found': { icon: 'search', title: 'پیدا نشد', description: 'این مورد وجود ندارد یا به آن دسترسی ندارید.' },
};

export type PageStateProps = {
  kind: PageStateKind;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Skeleton rows for `loading` (shape of the real content). */
  rows?: number;
  className?: string;
};

/** Shared page states (page-contracts): loading skeleton, empty with action, error/offline/permission/etc. */
export function PageState({ kind, title, description, action, rows = 3, className }: PageStateProps) {
  if (kind === 'loading') {
    return (
      <div className={cn('flex flex-col gap-3', className)} aria-busy="true" aria-label="در حال بارگذاری">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }
  const d = DEFAULTS[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={cn('flex flex-col items-center gap-3 px-4 py-10 text-center', className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-subtle text-fg-brand">
        {kind === 'unknown-result' ? <Spinner size={28} /> : <Icon name={d.icon} size={28} />}
      </span>
      <p className="text-heading-s text-fg-primary">{title ?? d.title}</p>
      {(description ?? d.description) ? <p className="max-w-80 text-body-m text-fg-secondary">{description ?? d.description}</p> : null}
      {action ? <div className="mt-2 flex w-full max-w-80 flex-col gap-2">{action}</div> : null}
    </div>
  );
}

/** Success screen with the next main action (e.g. «ثبت کالای بعدی», «فروش بعدی»). */
export function ResultScreen({
  title,
  description,
  children,
  tone = 'success',
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  tone?: 'success' | 'warning';
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
      <span className={cn('flex size-16 items-center justify-center rounded-full', tone === 'success' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning')}>
        <Icon name={tone === 'success' ? 'check-circle' : 'alert-warning'} size={34} />
      </span>
      <p className="text-heading-l text-fg-primary">{title}</p>
      {description ? <p className="text-body-m text-fg-secondary">{description}</p> : null}
      {children ? <div className="mt-2 w-full">{children}</div> : null}
    </div>
  );
}

export function OfflineBanner({ online }: { online: boolean }) {
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-warning-subtle px-4 py-2 text-label-s text-warning">
      <Icon name="offline" size={16} />
      اتصال اینترنت برقرار نیست؛ ثبت نهایی غیرفعال است و پیش‌نویس‌ها حفظ می‌شوند.
    </div>
  );
}
