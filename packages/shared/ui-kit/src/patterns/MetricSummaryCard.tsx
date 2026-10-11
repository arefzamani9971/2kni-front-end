'use client';
import type { MetricSummaryProps } from './MetricSummary.types';

/** Figma bulk review 358:500: one summary card with avatar on mobile. */
export function MetricSummaryCard({ label, avatarLabel, metrics, description }: MetricSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label={label}
        className="border-line bg-surface flex items-center gap-3 rounded-lg border p-4"
      >
        <span
          className="bg-brand-subtle text-fg-brand flex size-12 shrink-0 items-center justify-center rounded-lg"
          aria-hidden
        >
          {avatarLabel}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {metrics.map((metric) => (
            <p
              key={metric.id}
              className={
                metric.tone === 'warning' ? 'text-warning text-body-m' : 'text-fg-primary text-body-m'
              }
            >
              {metric.text}
            </p>
          ))}
        </div>
      </section>
      {description ? <p className="text-body-s text-fg-secondary">{description}</p> : null}
    </div>
  );
}
