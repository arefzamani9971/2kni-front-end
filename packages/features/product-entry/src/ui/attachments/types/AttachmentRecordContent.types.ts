import type { AttachmentCandidate, AttachmentSelection } from '../../../domain/catalog-attachment.types';
import type { AttachmentRecordsProps } from './AttachmentRecords.types';

export type AttachmentRecordContentProps = Pick<AttachmentRecordsProps, 'disabled' | 'onChange'> & {
  candidate: AttachmentCandidate;
  selected?: AttachmentSelection;
  part: 'title' | 'codes' | 'unit' | 'membership' | 'alias' | 'card';
};
