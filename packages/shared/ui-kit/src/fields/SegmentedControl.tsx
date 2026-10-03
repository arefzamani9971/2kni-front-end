'use client';

import { cn } from '../lib/cn';
import type { SegmentOption } from './SegmentedControl.types';

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
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('bg-muted flex h-11 w-full rounded-md p-1', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'text-label-m flex-1 rounded-sm transition-colors',
            value === o.value
              ? 'bg-surface text-fg-brand shadow-subtle'
              : 'text-fg-secondary hover:text-fg-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
