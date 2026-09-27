import { cn } from '../lib/cn';

export type BarDatum = { label: string; value: number; display: string };

/** Home «روند فروش» bars: value on top, bar, day label (Figma home 312:8718). Pure CSS, no chart library. */
export function MiniBarChart({ data, height = 112, className, label }: { data: readonly BarDatum[]; height?: number; className?: string; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label} className={cn('flex w-full items-end gap-3', className)}>
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-stretch gap-2">
          <span className="tabular text-center text-label-s text-fg-primary">{d.display}</span>
          <div className="w-full bg-brand" style={{ height: Math.max(2, (d.value / max) * height) }} aria-hidden />
          <span className="truncate text-center text-label-s text-fg-primary">{d.label}</span>
        </div>
      ))}
    </figure>
  );
}
