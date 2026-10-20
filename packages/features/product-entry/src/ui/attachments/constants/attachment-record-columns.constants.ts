import type { GridColumnDefinition } from '@dukani/ui-kit';
import type { AttachmentSort } from '../../../domain/catalog-attachment.types';
import type { AttachmentHeaderKey, AttachmentRecordColumnId } from '../types/attachment-columns.types';

export const ATTACHMENT_RECORD_COLUMNS = [
  { id: 'title', headerKey: 'name', card: 'title', sortField: 'title' },
  { id: 'codes', headerKey: 'original' },
  { id: 'unit', headerKey: 'unit', card: 'control' },
  { id: 'membership', headerKey: 'membership', card: 'status' },
  { id: 'alias', headerKey: 'local', card: 'control' },
] as const satisfies readonly GridColumnDefinition<
  AttachmentRecordColumnId,
  AttachmentHeaderKey,
  AttachmentSort
>[];
