import type { ReactNode } from 'react';

export type SummaryLine = {
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'danger' | 'success' | 'brand';
  total?: boolean;
};
