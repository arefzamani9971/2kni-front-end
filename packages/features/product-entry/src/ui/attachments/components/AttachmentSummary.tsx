'use client';
import { memo, useMemo } from 'react';
import { Alert, DataGrid, useLocalList, type GridColumn } from '@dukani/ui-kit';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentSummaryProps } from '../types/AttachmentSummary.types';
import { attachmentSummary } from '../../../domain/attachment-summary';
import { AttachmentOutcome } from './AttachmentOutcome';
import type { AttachmentSummaryRow } from '../types/AttachmentOutcome.types';

const rowId = (entry: AttachmentSummaryRow) => entry.row.clientRowId;
const rowTitle = (entry: AttachmentSummaryRow) =>
  entry.row.title || entry.selection?.candidate.item.title || '';

/** CPB-D 1255:57/58 and CPB-M 1255:137/138: complete local snapshot, independent of commit chunking. */
export const AttachmentSummary = memo(function AttachmentSummary({ draft }: AttachmentSummaryProps) {
  const t = useAttachmentTranslations();
  const summary = useMemo(() => attachmentSummary(draft), [draft]);
  const source = useLocalList(summary.rows);
  const columns = useMemo<readonly GridColumn<AttachmentSummaryRow>[]>(
    () => [
      { id: 'title', header: t('name'), card: 'title', cell: rowTitle },
      { id: 'unit', header: t('unit'), cell: (entry) => entry.row.unitName },
      {
        id: 'original',
        header: t('original'),
        cell: (entry) => <bdi>{entry.row.originalBarcodes.join(' · ') || t('noCode')}</bdi>,
      },
      {
        id: 'local',
        header: t('local'),
        cell: (entry) => <bdi>{entry.row.localBarcode || t('unchanged')}</bdi>,
      },
      {
        id: 'outcome',
        header: t('membership'),
        card: 'status',
        cell: (entry) => <AttachmentOutcome entry={entry} />,
      },
    ],
    [t],
  );
  return (
    <>
      {draft.stage === 'result' ? (
        <Alert
          tone={summary.counts.failed ? 'warning' : 'success'}
          title={t('resultCounts', summary.counts)}
        />
      ) : (
        <Alert tone="info" title={t('hint')} />
      )}
      <p className="text-body-s">
        {t('chunks', { count: draft.selections.length, chunks: draft.chunks.length })}
      </p>
      <DataGrid
        source={source}
        columns={columns}
        getRowId={rowId}
        getRowLabel={rowTitle}
        label={t('review')}
      />
      {draft.stage === 'review' ? <Alert tone="info" title={t('audit')} /> : null}
    </>
  );
});
