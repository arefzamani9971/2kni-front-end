import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type SummaryLine = { label: ReactNode; value: ReactNode; tone?: 'default' | 'danger' | 'success' | 'brand'; total?: boolean };

/** Invoice/receipt summary (ui-guidelines §20.3): items, discount, tax, shipping, paid, remaining, final total emphasized. */
export function SummaryCard({ lines, className }: { lines: readonly SummaryLine[]; className?: string }) {
  return (
    <dl className={cn('flex w-full flex-col gap-2 rounded-md border border-line bg-surface p-4', className)}>
      {lines.map((l, i) => (
        <div key={i} className={cn('flex items-center justify-between gap-3', l.total && 'mt-1 border-t border-line pt-3')}>
          <dt className={cn(l.total ? 'text-label-l text-fg-primary' : 'text-body-m text-fg-secondary')}>{l.label}</dt>
          <dd
            className={cn(
              'tabular',
              l.total ? 'text-heading-m text-fg-primary' : 'text-body-m text-fg-primary',
              l.tone === 'danger' && 'text-danger',
              l.tone === 'success' && 'text-success',
              l.tone === 'brand' && 'text-fg-brand',
            )}
          >
            {l.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
