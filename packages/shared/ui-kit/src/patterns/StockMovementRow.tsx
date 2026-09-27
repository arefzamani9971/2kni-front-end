import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

const QUANTITY_TONE = {
  in: 'bg-brand-subtle text-fg-brand',
  out: 'bg-danger-subtle text-danger',
  neutral: 'bg-muted text-fg-secondary',
} as const;

/**
 * Figma `Production/Stock Movement Row` (494:165): card (radius md, border default, p spacing/3, gap spacing/3).
 * Start: title (Label/M) and reference/date (Body/M). End: 72px quantity tile — signed quantity (Label/M) over the
 * unit (Label/S); incoming is brand, outgoing danger. The sign carries direction too (not color only).
 */
export function StockMovementRow({
  title,
  reference,
  date,
  quantity,
  unit,
  direction,
  balance,
  className,
}: {
  title: ReactNode;
  reference?: ReactNode;
  date: ReactNode;
  quantity: ReactNode;
  unit?: ReactNode;
  direction: 'in' | 'out' | 'neutral';
  balance?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full items-center gap-3 rounded-md border border-line bg-surface p-3', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-label-m text-fg-primary">{title}</span>
        <span className="text-body-m text-fg-secondary">
          {date}
          {reference ? <> · {reference}</> : null}
        </span>
        {balance ? <span className="tabular text-body-s text-fg-secondary">{balance}</span> : null}
      </div>
      <div className={cn('flex w-18 shrink-0 flex-col items-center gap-1 rounded-md py-2', QUANTITY_TONE[direction])}>
        <span dir="ltr" className="tabular text-label-m">
          {quantity}
        </span>
        {unit ? <span className="text-label-s text-fg-primary">{unit}</span> : null}
      </div>
    </div>
  );
}
