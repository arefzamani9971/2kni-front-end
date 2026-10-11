import type { OperationId } from '@dukani/domain';
import type { toRegisterRequest } from './entry-draft';
import type { EntryDraft } from './entry-draft.types';
export type BulkRow = {
  readonly clientRowId: string;
  readonly quantityInput?: string;
  readonly entry: EntryDraft;
};
export type BulkDraft = {
  readonly schemaVersion: 1;
  readonly scanMode?: 'PlusOne' | 'ScanThenQuantity';
  readonly id: string;
  readonly sharedReceipt: BulkReceipt;
  readonly rows: readonly BulkRow[];
  readonly updatedAt: string;
  readonly lastScan?: { readonly clientRowId: string; readonly before: BulkRow | null };
  readonly pending?: { readonly operationId: OperationId; readonly body: BulkRequest };
  readonly result?: BulkResult;
};
export type BulkReceipt = {
  readonly kind: 'Purchase' | 'Opening';
  readonly supplierId?: string | null;
  readonly supplierInvoiceNo?: string | null;
  readonly documentDate?: string | null;
};
export type BulkRequest = {
  sharedReceipt: BulkReceipt;
  rows: { clientRowId: string; registration: ReturnType<typeof toRegisterRequest> }[];
};
export type BulkResult = {
  readonly purchaseId?: string | null;
  readonly results: readonly {
    readonly storeProductId: string;
    readonly catalogItemId: string;
    readonly catalogItemCreated: boolean;
    readonly purchaseId?: string | null;
    readonly sku: string;
    readonly onHand: string;
    readonly salePriceAmount?: string | null;
    readonly clientRowId?: string | null;
    readonly rowIndex?: number | null;
  }[];
};
