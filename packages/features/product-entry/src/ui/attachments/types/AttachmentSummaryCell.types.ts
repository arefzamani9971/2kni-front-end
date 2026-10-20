import type { AttachmentSummaryColumnId } from './attachment-columns.types';
import type { AttachmentSummaryRow } from './AttachmentOutcome.types';

export type AttachmentSummaryCellProps = {
  entry: AttachmentSummaryRow;
  part: AttachmentSummaryColumnId;
};
