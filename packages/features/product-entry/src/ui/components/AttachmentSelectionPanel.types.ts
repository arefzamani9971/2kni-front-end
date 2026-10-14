import type { AttachmentDraft } from '../../domain/catalog-attachment.types';
import type { useAttachmentDraft } from '../hooks/use-attachment-draft';

export type AttachmentSelectionPanelProps = {
  draft: AttachmentDraft;
  state: ReturnType<typeof useAttachmentDraft>;
};
