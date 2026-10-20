import type { PendingReceipt, RecordedReceipt } from './receipt.types';
import type { ReceiptFormValues } from './receipt-form.types';

/**
 * The continuous single-product purchase (CPB-06), kept per user and store: the form of the current turn, the turn
 * frozen while its answer is unknown, and the last confirmed receipt (an optional view, never carried into the
 * next form).
 */
export type ContinuousDraft = {
  readonly schemaVersion: 1;
  readonly productId: string | null;
  readonly form: ReceiptFormValues;
  readonly pending: PendingReceipt | null;
  readonly last: RecordedReceipt | null;
};
