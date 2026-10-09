import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';

export function Spinner({
  size = 20,
  className,
  label,
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  const t = useUiTranslations();
  label ??= t('controls.loading');

  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
