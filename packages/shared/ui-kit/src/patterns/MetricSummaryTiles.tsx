'use client';
import { Icon } from '../icons/Icon';
import type { MetricSummaryProps } from './MetricSummary.types';

/** Figma bulk review 358:5363: one tile per metric on desktop. */
export function MetricSummaryTiles({ label, metrics, description }: MetricSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {description ? <p className="text-body-s text-fg-secondary">{description}</p> : null}
      <section aria-label={label} className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={
              (metric.tone === 'brand' ? 'bg-brand-subtle' : 'bg-muted') +
              ' text-body-m flex flex-col gap-2 rounded-lg p-4'
            }
          >
            <Icon name={metric.icon} size={20} className="text-fg-brand" />
            <p>{metric.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
