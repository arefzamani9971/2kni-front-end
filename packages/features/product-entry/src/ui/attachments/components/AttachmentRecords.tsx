'use client';
import { memo, useMemo } from 'react';
import { DataGrid, PageState, type GridColumn } from '@dukani/ui-kit';
import type { AttachmentCandidate } from '../../../domain/catalog-attachment.types';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { AttachmentRecordCell } from './AttachmentRecordCell';
import type { AttachmentRecordsProps } from '../types/AttachmentRecords.types';

const rowId = (row: AttachmentCandidate) => row.item.id;
const rowLabel = (row: AttachmentCandidate) => row.item.title;

/** CPB-D 1255:51 / CPB-M 1255:131. Shared remote grid; editable controls keep their domain selection model. */
export const AttachmentRecords = memo(function AttachmentRecords({
  source,
  selection,
  onSelectAllResults,
  disabled,
  onChange,
}: AttachmentRecordsProps) {
  const t = useAttachmentTranslations();
  const columns = useMemo<readonly GridColumn<AttachmentCandidate, 'title'>[]>(() => {
    const cell = (
      candidate: AttachmentCandidate,
      part: 'title' | 'codes' | 'unit' | 'membership' | 'alias',
    ) => (
      <AttachmentRecordCell
        candidate={candidate}
        selection={selection}
        disabled={disabled}
        onChange={onChange}
        part={part}
      />
    );
    return [
      {
        id: 'title',
        header: t('name'),
        card: 'title',
        sortField: 'title',
        cell: (row) => cell(row, 'title'),
      },
      { id: 'codes', header: t('original'), cell: (row) => cell(row, 'codes') },
      { id: 'unit', header: t('unit'), card: 'control', cell: (row) => cell(row, 'unit') },
      { id: 'membership', header: t('membership'), card: 'status', cell: (row) => cell(row, 'membership') },
      { id: 'alias', header: t('local'), card: 'control', cell: (row) => cell(row, 'alias') },
    ];
  }, [t, selection, disabled, onChange]);
  return (
    <DataGrid
      source={source}
      selection={selection}
      onSelectAllResults={onSelectAllResults}
      unit={t('name')}
      columns={columns}
      getRowId={rowId}
      getRowLabel={rowLabel}
      label={t('title')}
      empty={<PageState kind="empty" title={t('empty')} />}
    />
  );
});
