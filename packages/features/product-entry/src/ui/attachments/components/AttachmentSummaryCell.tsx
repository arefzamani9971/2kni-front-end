'use client';
import { memo } from 'react';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { attachmentSummaryRowTitle } from '../presentation/attachment-summary-row';
import type { AttachmentSummaryCellProps } from '../types/AttachmentSummaryCell.types';
import { AttachmentOutcome } from './AttachmentOutcome';

export const AttachmentSummaryCell = memo(function AttachmentSummaryCell({
  entry,
  part,
}: AttachmentSummaryCellProps) {
  const t = useAttachmentTranslations();
  switch (part) {
    case 'title':
      return attachmentSummaryRowTitle(entry);
    case 'unit':
      return entry.row.unitName;
    case 'original':
      return <bdi>{entry.row.originalBarcodes.join(' · ') || t('noCode')}</bdi>;
    case 'local':
      return <bdi>{entry.row.localBarcode || t('unchanged')}</bdi>;
    case 'outcome':
      return <AttachmentOutcome entry={entry} />;
  }
});
