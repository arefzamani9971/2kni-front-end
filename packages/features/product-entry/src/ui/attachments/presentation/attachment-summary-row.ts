import type { AttachmentSummaryRow } from '../types/AttachmentOutcome.types';

export const attachmentSummaryRowId = (entry: AttachmentSummaryRow) => entry.row.clientRowId;
export const attachmentSummaryRowTitle = (entry: AttachmentSummaryRow) =>
  entry.row.title || entry.selection?.candidate.item.title || '';
