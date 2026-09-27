import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Tone } from '../lib/types';

const SUBTLE: Record<Tone, string> = {
  neutral: 'bg-muted text-fg-secondary',
  brand: 'bg-brand-subtle text-fg-brand',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

const OUTLINE: Record<Tone, string> = {
  neutral: 'border border-line bg-surface text-fg-secondary',
  brand: 'border border-focus bg-surface text-fg-brand',
  success: 'border border-success bg-surface text-success',
  warning: 'border border-warning bg-surface text-warning',
  danger: 'border border-danger bg-surface text-danger',
  info: 'border border-info bg-surface text-info',
};

const badgeSize = cva('inline-flex items-center gap-1 rounded-full whitespace-nowrap', {
  variants: {
    size: {
      /** Figma `Production/Status Badge` (494:41): 28px, px spacing/2, 11/Medium. */
      md: 'h-7 px-2 text-caption font-medium',
      /** Figma `Badge` (498:72): 24px, px 10, Label/S. */
      sm: 'h-6 px-2.5 text-label-s',
    },
  },
  defaultVariants: { size: 'md' },
});

export type BadgeProps = {
  tone?: Tone;
  /** `subtle` = tinted fill (Verified, Available…); `outline` = surface + status border (Pending, StoreSpecific, Conflict). */
  appearance?: 'subtle' | 'outline';
  size?: 'sm' | 'md';
  icon?: IconName;
  children: ReactNode;
  className?: string;
};

/** Status pill: text + optional icon (never color alone). */
export function Badge({ tone = 'neutral', appearance = 'subtle', size, icon, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeSize({ size }), appearance === 'outline' ? OUTLINE[tone] : SUBTLE[tone], className)}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
