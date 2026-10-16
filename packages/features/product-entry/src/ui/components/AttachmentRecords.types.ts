import type { AttachmentCandidate } from '../../domain/catalog-attachment.types';
import type { AttachmentSelectionStore } from '../hooks/attachment-selection-store.types';
import type { GridSource } from '@dukani/ui-kit';

export type AttachmentRecordsProps = {
  candidates: readonly AttachmentCandidate[];
  source: GridSource<AttachmentCandidate, 'title'>;
  selection: AttachmentSelectionStore;
  onSelectAllResults: () => Promise<readonly string[]>;
  disabled: boolean;
  onChange: (id: string, changes: { catalogItemUnitId?: string; localBarcode?: string }) => void;
};
