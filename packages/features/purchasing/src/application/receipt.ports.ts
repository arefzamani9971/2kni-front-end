import type { ListQuery, Money, OperationId, PagedResult } from '@dukani/domain';
import type { ContinuousDraft } from '../domain/continuous-purchase.types';
import type { OpeningQueue } from '../domain/opening-queue.types';
import type {
  BarcodeIdentification,
  ProductPageFilter,
  ProductPageRow,
  ProductPageSort,
} from '../domain/product-page.types';
import type { QuickReceipt, RecordedReceipt } from '../domain/receipt.types';

/** `POST …/purchases/quick` ♻: one finalized single-product receipt; the operation id is the Idempotency-Key. */
export type ReceiptCommands = {
  record(storeId: string, receipt: QuickReceipt, operationId: OperationId): Promise<RecordedReceipt>;
};

/** The store's active products, one server page at a time (PAT-LIST-01). */
export type ProductPages = {
  page(
    storeId: string,
    query: ListQuery<ProductPageFilter, ProductPageSort>,
    signal?: AbortSignal,
  ): Promise<PagedResult<ProductPageRow>>;
};

/** Barcode → store product and unit; a lookup only, never a receipt or a quantity. */
export type BarcodeIdentifier = {
  identify(storeId: string, code: string, signal?: AbortSignal): Promise<BarcodeIdentification>;
};

/**
 * The explicit new base sale price after a receipt (BIZ-PUR-08): its own command on the product's current version,
 * so a failure never turns the recorded receipt into a failure.
 */
export type SalePrices = {
  setBasePrice(storeId: string, productId: string, amount: Money, reason: string): Promise<void>;
};

/** Local drafts of the two flows, per user and store (DraftStore). */
export type ReceiptDrafts = {
  continuous(storeId: string): Promise<ContinuousDraft | null>;
  saveContinuous(storeId: string, draft: ContinuousDraft): Promise<void>;
  queue(storeId: string, id: string): Promise<OpeningQueue | null>;
  saveQueue(storeId: string, queue: OpeningQueue): Promise<void>;
};
