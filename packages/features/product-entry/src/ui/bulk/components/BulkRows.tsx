'use client';
import { Button, RecordList, Overlay } from '@dukani/ui-kit';
import { memo, useState } from 'react';
import { titleOf } from '../../../domain/entry-draft';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { BULK_ROW_COLUMNS } from '../constants/bulk-row-columns.constants';
import type { BulkRowsProps } from '../types/BulkRows.types';
import { BulkRowCard } from './BulkRowCard';
import { BulkRowCell } from './BulkRowCell';

export const BulkRows = memo(function BulkRows({ rows, disabled, onChange, onDelete }: BulkRowsProps) {
  const t = useEntryTranslations();
  const [editing, setEditing] = useState<string | null>(null);
  const editedRow = rows.find((row) => row.clientRowId === editing);
  return (
    <>
      <Overlay
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={editedRow ? titleOf(editedRow.entry) : t('bulk.items')}
        actions={<Button onClick={() => setEditing(null)}>{t('back')}</Button>}
      >
        {editedRow
          ? BULK_ROW_COLUMNS.filter((column) => column.id !== 'title').map((column) => (
              <div key={column.id}>
                <BulkRowCell
                  row={editedRow}
                  column={column.id}
                  disabled={disabled}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              </div>
            ))
          : null}
      </Overlay>
      {/* Keep the unpaged editor and mobile edit overlay; DataGrid would change both interactions. */}
      <RecordList
        label={t('bulk.items')}
        columns={BULK_ROW_COLUMNS.map((column) => t(column.headerKey))}
        rows={rows.map((row) => ({
          id: row.clientRowId,
          card: <BulkRowCard row={row} disabled={disabled} onEdit={setEditing} />,
          cells: BULK_ROW_COLUMNS.map((column) => (
            <BulkRowCell
              key={column.id}
              row={row}
              column={column.id}
              disabled={disabled}
              onChange={onChange}
              onDelete={onDelete}
            />
          )),
        }))}
      />
    </>
  );
});
