'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { moneyOrZero } from '../../domain/home';
import { useReportsModule } from '../../module';
import { reportKeys } from './report-keys';

export const useTodayMetrics = () => {
  const { reports } = useReportsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: reportKeys(store.id).custom('summary', 'Today'),
    queryFn: ({ signal }) => reports.summary(store.id, 'Today', signal),
    select: (s) => ({ sales: moneyOrZero(s.netSales.current), received: moneyOrZero(s.receivedRials), lowStockCount: s.lowStockCount }),
    staleTime: 60_000,
  });
};
