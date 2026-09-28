'use client';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { useProductEntryModule } from '../../module';
import { entryKeys } from './entry-keys';

export const useTitleCheck = (title: string) => {
  const { catalog } = useProductEntryModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: entryKeys(store.id).custom('title-check', title),
    queryFn: ({ signal }) => catalog.titleCheck(store.id, title, signal),
    enabled: title.trim().length >= 3,
    staleTime: 30_000,
  });
};
