import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  selected?: boolean;
  children: ReactNode;
};

/**
 * Figma `Production/Chip` (494:34, Selected Yes/No): 44px pill (touch/min), px spacing/3, Label/S, border default.
 * Selected = brand-subtle fill + brand text; also shown with a check, not color only.
 */
export function Chip({ selected = false, className, children, type, ...rest }: ChipProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-touch shrink-0 items-center gap-1 rounded-full border border-line px-3 text-label-s transition-colors',
        selected ? 'bg-brand-subtle text-fg-brand' : 'bg-surface text-fg-primary hover:bg-muted',
        className,
      )}
      {...rest}
    >
      {selected ? <Icon name="check" size={14} /> : null}
      {children}
    </button>
  );
}

export function ChipGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {children}
    </div>
  );
}
