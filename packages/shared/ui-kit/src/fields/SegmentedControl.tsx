'use client';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type SegmentOption<V extends string> = { value: V; label: ReactNode };

/** Two to four exclusive choices in one row (e.g. «کالا | خدمت», «یک‌رو | دورو»). */
export function SegmentedControl<V extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  options: readonly SegmentOption<V>[];
  label?: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex h-11 w-full rounded-md bg-muted p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-sm text-label-m transition-colors',
            value === o.value ? 'bg-surface text-fg-brand shadow-subtle' : 'text-fg-secondary hover:text-fg-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
