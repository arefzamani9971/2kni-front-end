'use client';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useLinkComponent } from './LinkProvider';

export function Link({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  const Router = useLinkComponent();
  if (!Router) return <a {...props}>{children}</a>;
  // the router link is injected once by the app (stable reference), not created during render
  // eslint-disable-next-line react-hooks/static-components
  return <Router {...props}>{children}</Router>;
}
