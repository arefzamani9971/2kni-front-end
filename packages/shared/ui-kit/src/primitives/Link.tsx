'use client';
import { createContext, useContext, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

/** Any router link component with an `href` prop (Next.js Link, React Router Link…). */
export type LinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }>;

const LinkContext = createContext<LinkComponent | null>(null);

/** Apps inject their router link once; ui-kit stays router-agnostic. */
export function LinkProvider({ component, children }: { component: LinkComponent; children: ReactNode }) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}

export function Link({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  const Router = useContext(LinkContext);
  if (!Router) return <a {...props}>{children}</a>;
  // the router link is injected once by the app (stable reference), not created during render
  // eslint-disable-next-line react-hooks/static-components
  return <Router {...props}>{children}</Router>;
}
