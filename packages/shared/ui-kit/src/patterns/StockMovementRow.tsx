import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Figma `Stock Movement Row`: movement type, reference and date on the start; signed quantity and balance on the end. */
export function StockMovementRow({
  title,
  reference,
  date,
  quantity,
  direction,
  balance,
  className,
}: {
  title: ReactNode;
  reference?: ReactNode;
  date: ReactNode;
  quantity: ReactNode;
  direction: 'in' | 'out' | 'neutral';
  balance?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full items-start gap-3 border-b border-line py-3', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-label-m text-fg-primary">{title}</span>
        {reference ? <span className="text-label-s text-fg-secondary">{reference}</span> : null}
        <span className="text-caption text-fg-secondary">{date}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn('tabular text-label-m', direction === 'in' && 'text-success', direction === 'out' && 'text-danger')}
        >
          {quantity}
        </span>
        {balance ? <span className="tabular text-caption text-fg-secondary">{balance}</span> : null}
      </div>
    </div>
  );
}
