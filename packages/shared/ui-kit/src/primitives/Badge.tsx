import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Tone } from '../lib/types';

const TONES: Record<Tone, string> = {
  neutral: 'bg-muted text-fg-secondary',
  brand: 'bg-brand-subtle text-fg-brand',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

export type BadgeProps = { tone?: Tone; icon?: IconName; children: ReactNode; className?: string };

/** Status Badge (Figma `Status/…`): pill, 12px medium, 29px tall; text + optional icon (never color alone). */
export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-label-s whitespace-nowrap', TONES[tone], className)}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
