import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type MetricCardProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** Change vs. the comparison period, e.g. «+۲۰۰ (۵۰٪)»; «—» when the base is zero. */
  delta?: ReactNode;
  deltaTone?: 'brand' | 'success' | 'danger' | 'neutral';
  /** Partial data (e.g. profit with unknown costs) — stays visible on the card. */
  note?: ReactNode;
  className?: string;
};

/** Figma `Metric Card` (117:2): radius 16, label 12/Medium, value 18/DemiBold, unit 14, delta 12/Medium. */
export function MetricCard({ label, value, unit, delta, deltaTone = 'brand', note, className }: MetricCardProps) {
  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-line bg-surface p-4', className)}>
      <p className="text-label-s text-fg-primary">{label}</p>
      <p className="tabular text-heading-m text-fg-primary">{value}</p>
      {unit ? <p className="text-body-m text-fg-primary">{unit}</p> : null}
      {delta ? (
        <p
          className={cn(
            'text-label-s',
            deltaTone === 'brand' && 'text-fg-brand',
            deltaTone === 'success' && 'text-success',
            deltaTone === 'danger' && 'text-danger',
            deltaTone === 'neutral' && 'text-fg-secondary',
          )}
        >
          {delta}
        </p>
      ) : null}
      {note ? <p className="text-caption text-warning">{note}</p> : null}
    </div>
  );
}
