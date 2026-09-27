import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';

export type AlertTone = 'danger' | 'warning' | 'info' | 'success';

const TONES: Record<AlertTone, { box: string; icon: IconName }> = {
  danger: { box: 'bg-danger-subtle border-danger text-danger', icon: 'alert-danger' },
  warning: { box: 'bg-warning-subtle border-warning text-warning', icon: 'alert-warning' },
  info: { box: 'bg-info-subtle border-info text-info', icon: 'info' },
  success: { box: 'bg-success-subtle border-success text-success', icon: 'check-circle' },
};

export type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  description?: ReactNode;
  /** Recovery action (e.g. «ثبت سریع موجودی», «تلاش دوباره»). */
  action?: ReactNode;
  className?: string;
};

/**
 * Figma `Alert` (115:18, Type=Danger): subtle background, 1px status border, radius 12, icon 24 +
 * Medium title + Regular description. Validation errors never use green/brand frames (ui-guidelines).
 */
export function Alert({ tone = 'danger', title, description, action, className }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex w-full items-start gap-3 rounded-md border px-4 py-3', t.box, className)}
    >
      <Icon name={t.icon} size={24} />
      <div className="flex flex-1 flex-col gap-2 text-body-m">
        <p className="text-label-m">{title}</p>
        {description ? <div className="text-body-m">{description}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
