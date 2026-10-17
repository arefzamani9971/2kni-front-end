'use client';
import { useReportTranslations } from '../i18n/use-report-translations';
import { ChartFrame, MiniBarChart } from '@dukani/ui-kit';
import { useWeekSales } from '../hooks/use-week-sales';
import { NO_BARS } from './WeekSalesSection.constants';
import { ReportRefreshNotice } from './ReportRefreshNotice';

/**
 * «فروش این هفته» bar chart in thousand toman, inside the shared `ChartFrame` (developer guide §10): skeleton while
 * loading, an error with retry instead of a vanished or zero chart when the series fails (F04 §10, F04-S05), and
 * the bars as an accessible table.
 */
export function WeekSalesSection() {
  const t = useReportTranslations();
  const q = useWeekSales();
  const bars = q.data?.bars ?? NO_BARS;
  return (
    <div className="flex flex-col gap-3">
      <ReportRefreshNotice
        failed={!!q.data && !!q.error}
        refreshing={q.isFetching}
        onRetry={() => void q.refetch()}
      />
      <ChartFrame
        title={t('weekSales')}
        description={q.data?.caption}
        data={bars}
        status={q.data ? 'ready' : q.isPending ? 'loading' : 'error'}
        onRetry={() => void q.refetch()}
        categoryLabel={t('day')}
        valueLabel={t('salesThousand')}
      >
        <MiniBarChart label={t('trend')} data={bars} height={180} />
      </ChartFrame>
    </div>
  );
}
