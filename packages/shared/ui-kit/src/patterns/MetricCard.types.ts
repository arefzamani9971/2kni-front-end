import type { ReactNode } from 'react';

export type MetricCardProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  /** Change vs. the comparison period, e.g. «+۲۰۰ (۵۰٪)»; «—» when the base is zero. */
  delta?: ReactNode;
  deltaTone?: 'brand' | 'success' | 'danger' | 'neutral';
  /** Partial data (e.g. profit with unknown costs) — stays visible on the card. */
  note?: ReactNode;
  className?: string;
};
