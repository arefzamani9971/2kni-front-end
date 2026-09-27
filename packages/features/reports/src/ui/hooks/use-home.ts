'use client';
import { createQueryKeys, useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { attentionItems, moneyOrZero, weekBars, weekCaption } from '../../domain/home';
import { useReportsModule } from '../../module';

export const reportKeys = createQueryKeys('reports');

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

export const useAttention = () => {
  const { reports } = useReportsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: reportKeys(store.id).custom('actions'),
    queryFn: ({ signal }) => reports.actionCounts(store.id, signal),
    select: (c) => attentionItems(c.byKind),
  });
};

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
