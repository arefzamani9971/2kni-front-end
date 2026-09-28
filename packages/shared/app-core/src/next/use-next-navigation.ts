'use client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { Navigation } from '@dukani/platform';

/** Navigation port backed by the App Router. */
export const useNextNavigation = (): Navigation => {
  const router = useRouter();
  return useMemo(() => ({ push: (h) => router.push(h), replace: (h) => router.replace(h), back: () => router.back() }), [router]);
};
