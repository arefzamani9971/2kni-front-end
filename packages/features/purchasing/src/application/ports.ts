import type { CursorPage, Dto } from '@dukani/contracts';
import type { OperationId } from '@dukani/domain';

export type PurchaseQuery = { readonly status?: Dto<'PurchaseStatus'>; readonly q?: string };

/** Port to the Purchasing module: suppliers and receipts (draft → finalize). */
export type PurchaseRepository = {
  list(storeId: string, query: PurchaseQuery, cursor: string | null, signal?: AbortSignal): Promise<CursorPage<Dto<'PurchaseSummaryDto'>>>;
  get(storeId: string, purchaseId: string, signal?: AbortSignal): Promise<Dto<'PurchaseDto'>>;
  createDraft(storeId: string, body: Dto<'CreatePurchaseDraftRequest'>): Promise<Dto<'PurchaseDto'>>;
  updateDraft(storeId: string, purchaseId: string, body: Dto<'UpdatePurchaseDraftRequest'>): Promise<Dto<'PurchaseDto'>>;
  discard(storeId: string, purchaseId: string): Promise<void>;
  totals(storeId: string, purchaseId: string, signal?: AbortSignal): Promise<Dto<'PurchaseTotalsDto'>>;
  finalize(storeId: string, purchaseId: string, body: Dto<'FinalizePurchaseRequest'>, operationId: OperationId): Promise<Dto<'PurchaseDto'>>;
  setAttachments(storeId: string, purchaseId: string, fileIds: string[]): Promise<Dto<'PurchaseDto'>>;
};

export type SupplierRepository = {
  list(storeId: string, signal?: AbortSignal): Promise<readonly Dto<'SupplierDto'>[]>;
  create(storeId: string, body: Dto<'UpsertSupplierRequest'>): Promise<Dto<'SupplierDto'>>;
};

export type ProductPick = { readonly id: string; readonly title: string; readonly meta: string };

/** Store products a line can be added for (read side of Inventory). */
export type ProductLookup = {
  search(storeId: string, q: string, signal?: AbortSignal): Promise<readonly ProductPick[]>;
  get(storeId: string, productId: string, signal?: AbortSignal): Promise<Dto<'StoreProductDto'>>;
};

export type UploadedFile = { readonly fileId: string; readonly name: string };

/** BCR-13: generic store file upload; only this adapter changes when the backend publishes it. */
export type FileUploader = {
  upload(storeId: string, file: File, kind: 'PurchaseAttachment' | 'ProductImage'): Promise<UploadedFile>;
};
