import { toPersianDigits } from '@dukani/domain';
import { cn } from '../lib/cn';

/** «گام ۲ از ۵» with a thin progress bar for wizards (product entry, purchase). */
export function StepIndicator({ current, total, label, className }: { current: number; total: number; label?: string; className?: string }) {
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="flex justify-between text-label-s text-fg-secondary">
        <span>{label}</span>
        <span>
          گام {toPersianDigits(current)} از {toPersianDigits(total)}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
        <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}
