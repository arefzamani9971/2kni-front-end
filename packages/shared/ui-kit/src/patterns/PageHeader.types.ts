import type { ReactNode } from 'react';

export type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  back: () => void;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
};
