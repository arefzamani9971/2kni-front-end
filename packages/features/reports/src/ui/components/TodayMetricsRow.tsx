'use client';
import { formatMoney, MONEY_UNIT_LABEL } from '@dukani/domain';
import { MetricCard, PageState, Skeleton } from '@dukani/ui-kit';
import { useTodayMetrics } from '../hooks/use-today-metrics';

/** Metrics row (Figma home «Metrics»): in RTL «دریافت امروز» is first, like the frame. */
export function TodayMetricsRow() {
  const q = useTodayMetrics();
  if (q.isPending)
    return (
      <div className="flex gap-3">
        <Skeleton className="h-36 flex-1 rounded-lg" />
        <Skeleton className="h-36 flex-1 rounded-lg" />
      </div>
    );
  if (!q.data) return <PageState kind="error" description={q.error?.message} />;
  return (
    <div className="flex gap-3">
      <MetricCard label="دریافت امروز" value={formatMoney(q.data.received, { unit: false })} unit={MONEY_UNIT_LABEL} />
      <MetricCard label="فروش امروز" value={formatMoney(q.data.sales, { unit: false })} unit={MONEY_UNIT_LABEL} />
    </div>
  );
}
