import type { ReactNode } from 'react';

export type AppBarProps = {
  title: ReactNode;
  /** Back target: a URL or a handler. Omit for root screens. */
  back?: string | (() => void);
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};
