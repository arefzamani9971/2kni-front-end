'use client';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { Navigation } from '@dukani/platform';

/** Next.js `Link` shaped as the ui-kit `LinkComponent` (passed to `<LinkProvider component={AppLink}>`). */
export const AppLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }>(
  function AppLink({ href, ...rest }, ref) {
    return <NextLink ref={ref} href={href} {...rest} />;
  },
);

/** Navigation port backed by the App Router. */
export const useNextNavigation = (): Navigation => {
  const router = useRouter();
  return useMemo(() => ({ push: (h) => router.push(h), replace: (h) => router.replace(h), back: () => router.back() }), [router]);
};
