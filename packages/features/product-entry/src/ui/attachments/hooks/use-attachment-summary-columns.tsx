'use client';
import { useGridColumns } from '@dukani/ui-kit';
import { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import { AttachmentSummaryCell } from '../components/AttachmentSummaryCell';
import { ATTACHMENT_SUMMARY_COLUMNS } from '../constants/attachment-summary-columns.constants';
import type { AttachmentHeaderKey, AttachmentSummaryColumnId } from '../types/attachment-columns.types';
import type { AttachmentSummaryRow } from '../types/AttachmentOutcome.types';

const renderCell = (entry: AttachmentSummaryRow, part: AttachmentSummaryColumnId) => (
  <AttachmentSummaryCell entry={entry} part={part} />
);

export function useAttachmentSummaryColumns() {
  const t = useAttachmentTranslations();
  return useGridColumns<AttachmentSummaryRow, AttachmentSummaryColumnId, AttachmentHeaderKey>({
    definitions: ATTACHMENT_SUMMARY_COLUMNS,
    translate: t,
    renderCell,
  });
}
