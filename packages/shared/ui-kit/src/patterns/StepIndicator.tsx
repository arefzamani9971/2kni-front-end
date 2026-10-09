import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';

/** «گام ۲ از ۵» with a thin progress bar for wizards (product entry, purchase). */
export function StepIndicator({
  current,
  total,
  label,
  className,
}: {
  current: number;
  total: number;
  label?: string;
  className?: string;
}) {
  const t = useUiTranslations();
  const progress = t('steps.progress', { current, total });
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      <div className="text-label-s text-fg-secondary flex justify-between">
        <span>{label}</span>
        <span>{progress}</span>
      </div>
      <div
        className="bg-muted h-1 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-label={label ?? t('steps.label')}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={progress}
      >
        <div
          className="bg-brand h-full rounded-full transition-[width]"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
