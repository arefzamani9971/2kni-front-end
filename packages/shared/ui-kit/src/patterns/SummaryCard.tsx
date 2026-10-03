import { cn } from '../lib/cn';
import type { SummaryLine } from './SummaryCard.types';

/** Invoice/receipt summary (ui-guidelines §20.3): items, discount, tax, shipping, paid, remaining, final total emphasized. */
export function SummaryCard({ lines, className }: { lines: readonly SummaryLine[]; className?: string }) {
  return (
    <dl className={cn('border-line bg-surface flex w-full flex-col gap-2 rounded-md border p-4', className)}>
      {lines.map((l, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center justify-between gap-3',
            l.total && 'border-line mt-1 border-t pt-3',
          )}
        >
          <dt className={cn(l.total ? 'text-label-l text-fg-primary' : 'text-body-m text-fg-secondary')}>
            {l.label}
          </dt>
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
