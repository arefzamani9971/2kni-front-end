import { useLocale } from '@dukani/i18n';
import { cn } from '../lib/cn';
/** Figma Workflow Stepper 358:5354 / 632:304: read-only progress, labels supplied by its owning flow. */
export function WorkflowStepper({
  steps,
  current,
  label,
}: {
  steps: readonly string[];
  current: number;
  label: string;
}) {
  const locale = useLocale();
  return (
    <ol aria-label={label} className="border-line bg-surface flex gap-2 rounded-md border px-5 py-3.5">
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === current ? 'step' : undefined}
          className="flex flex-1 items-center justify-center gap-2"
        >
          <span
            aria-hidden="true"
            className={cn(
              'text-label-s flex size-7 shrink-0 items-center justify-center rounded-full',
              index === current ? 'bg-brand text-inverse' : 'bg-muted text-fg-tertiary',
            )}
          >
            {new Intl.NumberFormat(locale).format(index + 1)}
          </span>
          <span className={cn('text-body-m', index === current ? 'text-fg-primary' : 'text-fg-secondary')}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
