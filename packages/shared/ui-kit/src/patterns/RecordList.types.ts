import type { ReactNode } from 'react';
export type RecordListProps = {
  readonly columns: readonly ReactNode[];
  readonly rows: readonly {
    readonly id: string;
    readonly card: ReactNode;
    readonly cells: readonly ReactNode[];
  }[];
  readonly label: string;
};
