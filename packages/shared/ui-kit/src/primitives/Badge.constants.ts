import { cva } from 'class-variance-authority';
import type { Tone } from '../lib/types';

export const SUBTLE: Record<Tone, string> = {
  neutral: 'bg-muted text-fg-secondary',
  brand: 'bg-brand-subtle text-fg-brand',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

export const OUTLINE: Record<Tone, string> = {
  neutral: 'border border-line bg-surface text-fg-secondary',
  brand: 'border border-focus bg-surface text-fg-brand',
  success: 'border border-success bg-surface text-success',
  warning: 'border border-warning bg-surface text-warning',
  danger: 'border border-danger bg-surface text-danger',
  info: 'border border-info bg-surface text-info',
};

export const badgeSize = cva('inline-flex items-center gap-1 rounded-full whitespace-nowrap', {
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
