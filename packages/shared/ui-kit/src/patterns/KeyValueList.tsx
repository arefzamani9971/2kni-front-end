import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Label/value pairs (review screens, invoice details). Numbers use tabular figures. */
export function KeyValueList({ items, className }: { items: readonly { label: ReactNode; value: ReactNode; emphasis?: boolean }[]; className?: string }) {
  return (
    <dl className={cn('flex w-full flex-col', className)}>
      {items.map((it, i) => (
        <div key={i} className="flex min-h-11 items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
          <dt className="text-body-m text-fg-secondary">{it.label}</dt>
          <dd className={cn('tabular text-end', it.emphasis ? 'text-heading-s text-fg-primary' : 'text-body-m text-fg-primary')}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
