import type { attachmentSummary } from '../../../domain/attachment-summary';

export type AttachmentSummaryRow = ReturnType<typeof attachmentSummary>['rows'][number];
