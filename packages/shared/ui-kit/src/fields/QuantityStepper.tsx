import { toPersianDigits } from '@dukani/domain';
import { cn } from '../lib/cn';

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** `compact` = cart line (42px, radius 10); `regular` = product page (46px, radius 12, Numeric/M value). */
  size?: 'compact' | 'regular';
  /** Accessible name of the whole control, e.g. «تعداد خودکار بیک». */
  label: string;
  disabled?: boolean;
  className?: string;
};

const SIZES = {
  compact: { root: 'h-10.5 gap-1 rounded-[10px] p-0.5', step: 'size-9 text-heading-s', value: 'w-11 text-label-m' },
  regular: { root: 'h-11.5 rounded-md', step: 'h-11 w-11 text-heading-m', value: 'w-16 text-numeric-m' },
} as const;

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
      className={cn('inline-flex w-fit items-center self-start border border-line bg-surface', s.root, disabled && 'opacity-45', className)}
    >
      <button type="button" className={stepClass} aria-label="افزایش" disabled={disabled || value >= max} onClick={() => set(value + step)}>
        +
      </button>
      <output aria-live="polite" className={cn('tabular text-center text-fg-primary', s.value)}>
        {toPersianDigits(value)}
      </output>
      <button type="button" className={stepClass} aria-label="کاهش" disabled={disabled || value <= min} onClick={() => set(value - step)}>
        −
      </button>
    </div>
  );
}
