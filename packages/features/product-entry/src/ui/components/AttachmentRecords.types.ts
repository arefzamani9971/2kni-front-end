import type { AttachmentCandidate, AttachmentSelection } from '../../domain/catalog-attachment.types';

export type AttachmentRecordsProps = {
  candidates: readonly AttachmentCandidate[];
  selections: AttachmentSelection[];
  disabled: boolean;
  onSelect: (candidate: AttachmentCandidate, selected: boolean) => void;
  onChange: (id: string, changes: { catalogItemUnitId?: string; localBarcode?: string }) => void;
};
