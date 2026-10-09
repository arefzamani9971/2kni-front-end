'use client';
import { useReportTranslations } from '../i18n/use-report-translations';
import { MiniBarChart, Section, Skeleton } from '@dukani/ui-kit';
import { useWeekSales } from '../hooks/use-week-sales';

/** «فروش این هفته» bar chart in thousand toman. */
export function WeekSalesSection() {
  const t = useReportTranslations();
  const q = useWeekSales();
  if (!q.data) return q.isPending ? <Skeleton className="h-72 w-full rounded-md" /> : null;
  return (
    <Section title={t('weekSales')} description={q.data.caption}>
      <MiniBarChart label={t('trend')} data={q.data.bars} height={180} />
    </Section>
  );
}
