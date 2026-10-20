import type { BulkRow } from '../../../domain/bulk-draft';
import type { useEntryTranslations } from '../../i18n/use-entry-translations';

export type BulkRowsProps = {
  rows: readonly BulkRow[];
  disabled: boolean;
  onChange: (id: string, update: (row: BulkRow) => BulkRow) => void;
  onDelete: (id: string) => void;
};

export type BulkRowColumnId = 'title' | 'quantity' | 'unit' | 'cost' | 'delete';

export type BulkRowColumn = {
  readonly id: BulkRowColumnId;
  readonly headerKey: Parameters<ReturnType<typeof useEntryTranslations>>[0];
};

export type BulkRowCellProps = Pick<BulkRowsProps, 'disabled' | 'onChange' | 'onDelete'> & {
  readonly row: BulkRow;
  readonly column: BulkRowColumnId;
};

export type BulkRowCardProps = Pick<BulkRowsProps, 'disabled'> & {
  readonly row: BulkRow;
  readonly onEdit: (id: string) => void;
};
