import type { AttachmentCandidate } from '../../../domain/catalog-attachment.types';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';

export type AttachmentRecordAliasProps = Pick<AttachmentRecordsProps, 'disabled' | 'onChange'> & {
  item: AttachmentCandidate['item'];
  value: string;
};
