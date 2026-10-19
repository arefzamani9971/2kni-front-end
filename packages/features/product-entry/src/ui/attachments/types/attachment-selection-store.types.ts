import type { SelectionStore } from '@dukani/ui-kit';
import type { AttachmentSelection } from '../../../domain/catalog-attachment.types';

export type AttachmentSelectionStore = SelectionStore & {
  readonly get: (id: string) => AttachmentSelection | undefined;
};
