import type { OperationId } from '@dukani/domain';
import type {
  AttachmentDraft,
  AttachmentFilter,
  AttachmentQuery,
  AttachmentPage,
  AttachmentCandidate,
  AttachmentRow,
  AttachmentPreview,
  AttachmentRequest,
  AttachmentOperation,
} from '../domain/catalog-attachment.types';

export type CatalogAttachments = {
  search(storeId: string, query: AttachmentQuery, signal?: AbortSignal): Promise<AttachmentPage>;
  snapshot(storeId: string, query: AttachmentFilter): Promise<AttachmentCandidate[]>;
  preview(storeId: string, rows: AttachmentRow[]): Promise<AttachmentPreview>;
  commit(storeId: string, operationId: OperationId, body: AttachmentRequest): Promise<AttachmentOperation>;
  recover(storeId: string, operationId: OperationId): Promise<AttachmentOperation>;
};
export type AttachmentDrafts = {
  get(storeId: string): Promise<AttachmentDraft | null>;
  update(
    storeId: string,
    transform: (draft: AttachmentDraft | null) => AttachmentDraft,
  ): Promise<AttachmentDraft>;
};
