import type { ReactNode } from 'react';

export type AlertTone = 'danger' | 'warning' | 'info' | 'success';

export type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  description?: ReactNode;
  /** Recovery action (e.g. «ثبت سریع موجودی», «تلاش دوباره»). */
  action?: ReactNode;
  className?: string;
};
