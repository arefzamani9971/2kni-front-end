'use client';
import type { ReactNode } from 'react';
import { createAdaptive } from '../responsive/adaptive';
import { Icon } from '../icons/Icon';
import type { IconName } from '../icons/Icon.types';
export type SummaryMetric = { id: string; text: ReactNode; icon: IconName; tone?: 'brand' | 'warning' };
type Props = {
  label: string;
  avatarLabel: string;
  metrics: readonly SummaryMetric[];
  description?: ReactNode;
};
function Card({ label, avatarLabel, metrics, description }: Props) {
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
function Tiles({ label, metrics, description }: Props) {
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
/** Figma bulk review 358:500/5363: one summary card on mobile, three metrics on desktop. */
export const MetricSummary = createAdaptive<Props>('MetricSummary', { mobile: Card, desktop: Tiles });
