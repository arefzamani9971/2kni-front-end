import type { ReactNode } from 'react';

export type RadioOption<V extends string> = {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};
