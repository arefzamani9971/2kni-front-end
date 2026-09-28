'use client';
import { createContext, useContext, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react';

/** Any router link component with an `href` prop (Next.js Link, React Router Link…). */
export type LinkComponent = ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }>;

const LinkContext = createContext<LinkComponent | null>(null);

/** Apps inject their router link once; ui-kit stays router-agnostic. */
export function LinkProvider({ component, children }: { component: LinkComponent; children: ReactNode }) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}

/** The injected router link, or null when the app did not provide one. */
export const useLinkComponent = () => useContext(LinkContext);
