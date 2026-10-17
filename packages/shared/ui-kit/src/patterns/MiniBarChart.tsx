import { cn } from '../lib/cn';
import type { BarDatum } from './MiniBarChart.types';

/** Home «روند فروش» bars: value on top, bar, day label (Figma home 312:8718). Pure CSS, no chart library. */
export function MiniBarChart({
  data,
  height = 112,
  className,
  label,
}: {
  data: readonly BarDatum[];
  height?: number;
  className?: string;
  label: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label} className={cn('desktop:gap-3 flex w-full items-end gap-2', className)}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-stretch gap-2">
          <span className="tabular text-label-s text-fg-primary text-center">{d.display}</span>
          <div
            className="bg-brand w-full"
            style={{ height: Math.max(2, (d.value / max) * height) }}
            aria-hidden
          />
          <span className="text-label-s text-fg-primary desktop:min-h-6 min-h-12 text-center break-words">
            {d.label}
          </span>
        </div>
      ))}
    </figure>
  );
}
