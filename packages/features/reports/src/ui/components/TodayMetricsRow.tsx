'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { useReportTranslations } from '../i18n/use-report-translations';
import { useLocale } from '@dukani/i18n';
import { normalizeDigits } from '@dukani/domain';
import { formatMoney } from '@dukani/domain';
import { MetricCard, PageState, Skeleton } from '@dukani/ui-kit';
import { useTodayMetrics } from '../hooks/use-today-metrics';

/** Metrics row (Figma home «Metrics»): in RTL «دریافت امروز» is first, like the frame. */
export function TodayMetricsRow() {
  const t = useReportTranslations();
  const errorMessage = useAppErrorMessage();
  const locale = useLocale();
  const money = (value: Parameters<typeof formatMoney>[0]) => {
    const text = formatMoney(value);
    return locale === 'fa' ? text : normalizeDigits(text).replaceAll('٬', ',').replaceAll('٫', '.');
  };
  const q = useTodayMetrics();
  if (q.isPending)
    return (
      <div className="flex gap-3">
        <Skeleton className="h-36 flex-1 rounded-lg" />
        <Skeleton className="h-36 flex-1 rounded-lg" />
      </div>
    );
  if (!q.data) return <PageState kind="error" description={q.error ? errorMessage(q.error) : undefined} />;
  return (
    <div className="flex gap-3">
      <MetricCard label={t('received')} value={money(q.data.received)} unit={t('unit')} />
      <MetricCard label={t('sales')} value={money(q.data.sales)} unit={t('unit')} />
    </div>
  );
}
