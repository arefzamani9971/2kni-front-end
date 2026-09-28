'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { attentionItems } from '../../domain/home';
import { useReportsModule } from '../../module';
import { reportKeys } from './report-keys';

export const useAttention = () => {
  const { reports } = useReportsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: reportKeys(store.id).custom('actions'),
    queryFn: ({ signal }) => reports.actionCounts(store.id, signal),
    select: (c) => attentionItems(c.byKind),
  });
};
