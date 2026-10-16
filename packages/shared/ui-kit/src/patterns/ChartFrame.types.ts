import type { ReactNode } from 'react';

/** One data point as the user reads it: `display` is the formatted value («۱۲٬۵۰۰ تومان»). */
export type ChartDatum = { readonly label: string; readonly value: number; readonly display: string };

export type ChartFrameProps = {
  readonly title: string;
  readonly description?: ReactNode;
  /** Also rendered as an accessible table, so the chart never depends on seeing the shapes. */
  readonly data: readonly ChartDatum[];
  readonly status?: 'loading' | 'ready' | 'error';
  readonly onRetry?: () => void;
  /** Column headers of the accessible table. */
  readonly categoryLabel?: string;
  readonly valueLabel?: string;
  readonly legend?: ReactNode;
  /** The visual (`MiniBarChart`, a future line chart…); hidden from assistive tech, the table carries the data. */
  readonly children: ReactNode;
  readonly className?: string;
};
