import type { ReactNode } from 'react';

export type GridCardListProps<T> = {
  readonly rows: readonly { readonly id: string; readonly row: T }[];
  readonly label: string;
  readonly busy: boolean;
  readonly children: (row: T, id: string) => ReactNode;
};
