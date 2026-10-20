'use client';
import { memo } from 'react';
import { DataGrid, PageState } from '@dukani/ui-kit';
import type { AttachmentCandidate } from '../../../domain/catalog-attachment.types';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { useAttachmentRecordColumns } from '../hooks/use-attachment-record-columns';
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
  const columns = useAttachmentRecordColumns({ selection, disabled, onChange });
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
