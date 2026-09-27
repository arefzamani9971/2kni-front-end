import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  selected?: boolean;
  children: ReactNode;
};

/** Figma `Chip` (Selected Yes/No): filter and quick-choice pill; selection is shown with a check, not color only. */
export function Chip({ selected = false, className, children, type, ...rest }: ChipProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1 rounded-full border px-3 text-label-s transition-colors',
        selected ? 'border-brand bg-brand-subtle text-fg-brand' : 'border-line bg-surface text-fg-secondary hover:bg-muted',
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
