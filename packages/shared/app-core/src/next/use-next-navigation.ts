'use client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { Navigation } from '@dukani/platform';

/**
 * Navigation port backed by the App Router. `replaceUrl` uses the history API, which the App Router keeps in sync
 * with `useSearchParams` without a server round trip.
 */
export const useNextNavigation = (): Navigation => {
  const router = useRouter();
  return useMemo(
    () => ({
      push: (h) => router.push(h),
      replace: (h) => router.replace(h),
      replaceUrl: (h) => {
        if (h !== window.location.pathname + window.location.search) window.history.replaceState(null, '', h);
      },
      back: () => router.back(),
    }),
    [router],
  );
};
