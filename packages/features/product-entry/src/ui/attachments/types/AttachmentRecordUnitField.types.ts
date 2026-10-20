import type { AttachmentCandidate } from '../../../domain/catalog-attachment.types';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';

export type AttachmentRecordUnitFieldProps = Pick<AttachmentRecordsProps, 'disabled' | 'onChange'> & {
  itemId: string;
  units: AttachmentCandidate['units'];
  value?: string;
};
