import type { OperationId } from '@dukani/domain';

/** Feature-owned read model; the HTTP adapter is checked against generated DTOs. */
export type AttachmentCandidate = {
  item: {
    id: string;
    title: string;
    productTypeId: string;
    productTypeName: string;
    keyAttributes?: string | null;
    myStoreProductId?: string | null;
  };
  units: { id: string; name: string; kind: 'Base' | 'Package'; barcodes: { code: string }[] }[];
};
export type AttachmentRow = {
  clientRowId: string;
  catalogItemId: string;
  catalogItemUnitId: string;
  localBarcode?: string | null;
};
export type AttachmentPreviewRow = {
  clientRowId: string;
  title: string;
  unitName: string;
  originalBarcodes: string[];
  localBarcode?: string | null;
  storeProductId?: string | null;
  errorCode?: string | null;
};
export type AttachmentPreview = { rows: AttachmentPreviewRow[]; previewToken: string; expiresAt: string };
export type AttachmentRequest = { rows: AttachmentRow[]; previewToken: string };
export type AttachmentResult = {
  clientRowId: string;
  status: 'Added' | 'AlreadyExists' | 'Failed' | 'Skipped';
  storeProductId?: string | null;
  errorCode?: string | null;
};
export type AttachmentOperation = {
  operationId: string;
  state: 'Pending' | 'Completed';
  results: AttachmentResult[];
};
export type AttachmentFilter = {
  q?: string | null;
  categoryId?: string | null;
  productTypeId?: string | null;
  onlyNotInMyStore?: boolean | null;
  cursor?: string | null;
  limit?: number;
};
export type AttachmentPage = {
  items: AttachmentCandidate[];
  nextCursor?: string | null;
  totalCount?: number | null;
};
export type AttachmentSelection = { candidate: AttachmentCandidate; row: AttachmentRow };
export type AttachmentChunk = {
  operationId: OperationId;
  body: AttachmentRequest;
  preview: AttachmentPreview;
  result?: AttachmentOperation;
};
export type AttachmentDraft = {
  schemaVersion: 1;
  selections: AttachmentSelection[];
  chunks: AttachmentChunk[];
  stage: 'select' | 'review' | 'pending' | 'result';
};
