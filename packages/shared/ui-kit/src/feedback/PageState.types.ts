import type { ReactNode } from 'react';

export type PageStateKind =
  'loading' | 'empty' | 'error' | 'offline' | 'permission' | 'not-released' | 'unknown-result' | 'not-found';

export type PageStateProps = {
  kind: PageStateKind;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Skeleton rows for `loading` (shape of the real content). */
  rows?: number;
  className?: string;
};
