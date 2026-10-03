import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

/** Any router link component with an `href` prop (Next.js Link, React Router Link…). */
export type LinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }
>;
