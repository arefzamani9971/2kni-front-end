'use client';
import { Alert } from '../feedback/Alert';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import { Skeleton } from '../primitives/Skeleton';
import type { ChartFrameProps } from './ChartFrame.types';

/**
 * Frame of every chart: title, loading/empty/error states and the data as a screen-reader table. The visual is pure
 * CSS/SVG from ui-kit (no chart library in features); colors come from tokens and values arrive pre-formatted.
 */
export function ChartFrame({
  title,
  description,
  data,
  status = 'ready',
  onRetry,
  categoryLabel,
  valueLabel,
  legend,
  children,
  className,
}: ChartFrameProps) {
  const t = useUiTranslations();
  return (
    <figure className={cn('bg-surface border-line flex flex-col gap-3 rounded-md border p-4', className)}>
      <figcaption className="flex flex-col gap-1">
        <span className="text-heading-m text-fg-primary">{title}</span>
        {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
      </figcaption>
      {status === 'loading' ? (
        <Skeleton className="h-32 w-full" />
      ) : status === 'error' ? (
        <Alert
          tone="danger"
          title={t('pageState.error.title')}
          action={
            onRetry ? (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                {t('controls.retry')}
              </Button>
            ) : undefined
          }
        />
      ) : data.length === 0 ? (
        <p className="text-body-m text-fg-secondary py-6 text-center">{t('chart.empty')}</p>
      ) : (
        <>
          <div aria-hidden>{children}</div>
          {legend}
          <table className="sr-only">
            <caption>{t('chart.data')}</caption>
            <thead>
              <tr>
                <th scope="col">{categoryLabel ?? t('chart.category')}</th>
                <th scope="col">{valueLabel ?? t('chart.value')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((datum) => (
                <tr key={datum.label}>
                  <th scope="row">{datum.label}</th>
                  <td>{datum.display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </figure>
  );
}
