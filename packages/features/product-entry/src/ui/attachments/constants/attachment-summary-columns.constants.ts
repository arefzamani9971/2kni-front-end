import type { GridColumnDefinition } from '@dukani/ui-kit';
import type { AttachmentHeaderKey, AttachmentSummaryColumnId } from '../types/attachment-columns.types';

export const ATTACHMENT_SUMMARY_COLUMNS = [
  { id: 'title', headerKey: 'name', card: 'title' },
  { id: 'unit', headerKey: 'unit' },
  { id: 'original', headerKey: 'original' },
  { id: 'local', headerKey: 'local' },
  { id: 'outcome', headerKey: 'membership', card: 'status' },
] as const satisfies readonly GridColumnDefinition<AttachmentSummaryColumnId, AttachmentHeaderKey>[];
