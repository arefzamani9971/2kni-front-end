'use client';
import { memo, useMemo } from 'react';
import { Alert, DataGrid, useLocalList } from '@dukani/ui-kit';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentSummaryProps } from '../types/AttachmentSummary.types';
import { attachmentSummary } from '../../../domain/attachment-summary';
import { useAttachmentSummaryColumns } from '../hooks/use-attachment-summary-columns';
import { attachmentSummaryRowId, attachmentSummaryRowTitle } from '../presentation/attachment-summary-row';

/** CPB-D 1255:57/58 and CPB-M 1255:137/138: complete local snapshot, independent of commit chunking. */
export const AttachmentSummary = memo(function AttachmentSummary({ draft }: AttachmentSummaryProps) {
  const t = useAttachmentTranslations();
  const summary = useMemo(() => attachmentSummary(draft), [draft]);
  const source = useLocalList(summary.rows);
  const columns = useAttachmentSummaryColumns();
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
        getRowId={attachmentSummaryRowId}
        getRowLabel={attachmentSummaryRowTitle}
        label={t('review')}
      />
      {draft.stage === 'review' ? <Alert tone="info" title={t('audit')} /> : null}
    </>
  );
});
