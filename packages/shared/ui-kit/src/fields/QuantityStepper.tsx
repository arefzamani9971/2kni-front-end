import { toPersianDigits } from '@dukani/domain';
import { cn } from '../lib/cn';
import type { QuantityStepperProps } from './QuantityStepper.types';
import { SIZES } from './QuantityStepper.constants';

/**
 * Figma `Quantity Stepper` (498:98): − value + in a bordered surface box; the steps use brand text, the value
 * primary text. Integer steps only — for decimal quantities use `QuantityField`.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  size = 'compact',
  label,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const s = SIZES[size];
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  const stepClass = cn(
    'flex shrink-0 items-center justify-center rounded-sm text-fg-brand transition-colors hover:bg-brand-subtle',
    'disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent',
    s.step,
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'border-line bg-surface inline-flex w-fit items-center self-start border',
        s.root,
        disabled && 'opacity-45',
        className,
      )}
    >
      <button
        type="button"
        className={stepClass}
        aria-label="افزایش"
        disabled={disabled || value >= max}
        onClick={() => set(value + step)}
      >
        +
      </button>
      <output aria-live="polite" className={cn('tabular text-fg-primary text-center', s.value)}>
        {toPersianDigits(value)}
      </output>
      <button
        type="button"
        className={stepClass}
        aria-label="کاهش"
        disabled={disabled || value <= min}
        onClick={() => set(value - step)}
      >
        −
      </button>
    </div>
  );
}
