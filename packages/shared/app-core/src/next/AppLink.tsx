'use client';
import NextLink from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

/** Next.js `Link` shaped as the ui-kit `LinkComponent` (passed to `<LinkProvider component={AppLink}>`). */
export const AppLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }>(
  function AppLink({ href, ...rest }, ref) {
    return <NextLink ref={ref} href={href} {...rest} />;
  },
);
