'use client';
import { MiniBarChart, Section, Skeleton } from '@dukani/ui-kit';
import { useWeekSales } from '../hooks/use-week-sales';

/** «فروش این هفته» bar chart in thousand toman. */
export function WeekSalesSection() {
  const q = useWeekSales();
  if (!q.data) return q.isPending ? <Skeleton className="h-72 w-full rounded-md" /> : null;
  return (
    <Section title="فروش این هفته" description={q.data.caption}>
      <MiniBarChart label="روند فروش / هزار تومان" data={q.data.bars} height={180} />
    </Section>
  );
}
