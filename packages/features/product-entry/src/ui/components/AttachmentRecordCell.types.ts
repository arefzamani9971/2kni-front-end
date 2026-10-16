import type { AttachmentRecordContentProps } from './AttachmentRecordContent.types';
import type { AttachmentSelectionStore } from '../hooks/attachment-selection-store.types';

export type AttachmentRecordCellProps = Omit<AttachmentRecordContentProps, 'selected' | 'onSelect'> & {
  readonly selection: AttachmentSelectionStore;
};
