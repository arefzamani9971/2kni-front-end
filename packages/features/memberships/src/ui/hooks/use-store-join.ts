'use client';
import { useAppQuery, useAppMutation, useQueryCache } from '@dukani/data';
import { useMembershipsModule } from '../../module';

export function useStoreJoin(code: string, signedIn: boolean) {
  const { memberships } = useMembershipsModule();
  const cache = useQueryCache();
  const statusKey = ['membership', code];
  const introduction = useAppQuery({
    queryKey: ['store-introduction', code],
    queryFn: ({ signal }) => memberships.resolve(code, signal),
  });
  const status = useAppQuery({
    queryKey: statusKey,
    queryFn: ({ signal }) => memberships.status(code, signal),
    enabled: signedIn && introduction.data?.available === true,
  });
  const join = useAppMutation({
    mutationFn: () => memberships.join(code),
    onSuccess: (data) => cache.set(statusKey, data),
    onError: () => {
      void status.refetch();
    },
  });
  const marketing = useAppMutation({ mutationFn: (storeId: string) => memberships.grantMarketing(storeId) });
  return { introduction, status, join, marketing };
}
