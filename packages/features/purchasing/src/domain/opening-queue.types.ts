import type { PendingReceipt } from './receipt.types';
import type { ReceiptFormValues } from './receipt-form.types';

/** `blocked`: the server refused an Opening because the product already has stock history (CPB-D04). */
export type OpeningItemStatus = 'pending' | 'recorded' | 'skipped' | 'blocked';

export type OpeningQueueItem = {
  readonly productId: string;
  readonly title: string;
  readonly status: OpeningItemStatus;
  readonly receipt: { readonly id: string; readonly number: number | null } | null;
};

/**
 * The grouped opening stock (CPB-04): a guide over independent receipts, not one transaction. Each item is its own
 * idempotent Opening; a failed, skipped or cancelled item never undoes the recorded ones.
 */
export type OpeningQueue = {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly items: readonly OpeningQueueItem[];
  /** The item being entered; null once nothing is left or the seller ended the queue. */
  readonly currentId: string | null;
  /** The current item's typed form, so a refresh restores it. */
  readonly form: { readonly productId: string; readonly values: ReceiptFormValues } | null;
  /** The current item frozen with its operation id while its answer is unknown. */
  readonly pending: (PendingReceipt & { readonly productId: string }) | null;
  readonly ended: boolean;
};

export type OpeningProgress = {
  readonly total: number;
  readonly recorded: number;
  readonly skipped: number;
  readonly blocked: number;
  readonly remaining: number;
};
