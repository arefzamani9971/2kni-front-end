'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { weekBars, weekCaption } from '../../domain/home';
import { useReportsModule } from '../../module';
import { reportKeys } from './report-keys';

export const useWeekSales = () => {
  const { reports } = useReportsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: reportKeys(store.id).custom('sales', 'ThisWeek'),
    queryFn: ({ signal }) => reports.sales(store.id, 'ThisWeek', signal),
    select: (r) => ({ bars: weekBars(r.series), caption: weekCaption(r.period.from, r.period.to) }),
    staleTime: 5 * 60_000,
  });
};
