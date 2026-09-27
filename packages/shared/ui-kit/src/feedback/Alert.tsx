import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';

export type AlertTone = 'danger' | 'warning' | 'info' | 'success';

const TONES: Record<AlertTone, { box: string; iconClass: string; icon: IconName }> = {
  danger: { box: 'bg-danger-subtle border-danger text-danger', iconClass: 'text-danger', icon: 'alert-danger' },
  warning: { box: 'bg-surface border-warning text-fg-primary', iconClass: 'text-warning', icon: 'alert-warning' },
  info: { box: 'bg-surface border-info text-fg-primary', iconClass: 'text-info', icon: 'info' },
  success: { box: 'bg-surface border-success text-fg-primary', iconClass: 'text-success', icon: 'check-circle' },
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
 * Figma `Production/Alert` (494:89): radius md, px spacing/4, py spacing/3, gap spacing/3, 24px status icon,
 * Label/M title + Body/M message. Danger = danger-subtle fill with danger text; Warning/Info (and Success) =
 * surface fill + status border + primary text. Validation errors never use green/brand frames (ui-guidelines).
 */
export function Alert({ tone = 'danger', title, description, action, className }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex w-full items-start gap-3 rounded-md border px-4 py-3', t.box, className)}
    >
      <Icon name={t.icon} size={24} className={cn('shrink-0', t.iconClass)} />
      <div className="flex flex-1 flex-col gap-2 text-body-m">
        <p className="text-label-m">{title}</p>
        {description ? <div className="text-body-m">{description}</div> : null}
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </div>
  );
}
