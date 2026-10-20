import type { useAttachmentTranslations } from '../../i18n/use-attachment-translations';
import type { AttachmentRecordContentProps } from './AttachmentRecordContent.types';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';

export type AttachmentHeaderKey = Parameters<ReturnType<typeof useAttachmentTranslations>>[0];
export type AttachmentRecordColumnId = Exclude<AttachmentRecordContentProps['part'], 'card'>;
export type AttachmentSummaryColumnId = 'title' | 'unit' | 'original' | 'local' | 'outcome';
export type AttachmentRecordColumnsOptions = Pick<
  AttachmentRecordsProps,
  'selection' | 'disabled' | 'onChange'
>;
