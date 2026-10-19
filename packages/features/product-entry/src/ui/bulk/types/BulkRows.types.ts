import type { BulkRow } from '../../../domain/bulk-draft';

export type BulkRowsProps = {
  rows: readonly BulkRow[];
  disabled: boolean;
  onChange: (id: string, update: (row: BulkRow) => BulkRow) => void;
  onDelete: (id: string) => void;
};
