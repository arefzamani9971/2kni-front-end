/** Where a new product entry was started from and returns to (US-F10-01). */
export type NewEntryHost = {
  /** A server purchase draft (`~/purchases/[id]/lines`). */
  readonly purchaseHostId?: string;
  /** The continuous purchase (CPB-06). */
  readonly continuousHost?: boolean;
  /** The scanned code that found no product. */
  readonly barcode?: string;
};
