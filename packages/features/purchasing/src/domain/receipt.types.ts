import type { DecimalString, Money } from '@dukani/domain';

export type ReceiptKind = 'Purchase' | 'Opening';

/** Known, estimated or unknown — never a zero standing in for «unknown» (F13 §5). */
export type ReceiptCostStatus = 'Known' | 'Estimated' | 'Unknown';

/** The one line of a single-product receipt as the seller entered it (F13 §4–§6). */
export type ReceiptLine = {
  readonly productId: string;
  readonly unitId: string;
  readonly quantity: DecimalString;
  readonly costStatus: ReceiptCostStatus;
  /** Null exactly when the cost is unknown. */
  readonly unitCost: Money | null;
  /** Only for a known cost of zero (a real gift or free sample). */
  readonly zeroCostReason: string | null;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
};

/** Charges of this one receipt (BCR-16): shared by the line amount, the side charge kept apart from any tax. */
export type ReceiptCharges = {
  readonly discount: Money | null;
  readonly shipping: Money | null;
  readonly sideCharge: Money | null;
};

/** One idempotent single-product receipt: a continuous purchase turn (CPB-06) or one opening item (CPB-04). */
export type QuickReceipt = {
  readonly kind: ReceiptKind;
  readonly line: ReceiptLine;
  readonly supplierId: string | null;
  readonly invoiceNo: string | null;
  /** Purchase: the business date (the server defaults it to today); Opening: null = unknown, never made up. */
  readonly documentDate: string | null;
  /** The owner's reason for an invoice number this supplier already used (BIZ-PUR-03). */
  readonly duplicateInvoiceReason: string | null;
  readonly charges: ReceiptCharges;
};

/** What the server confirmed for one receipt; the snapshot names are the receipt's, not today's product. */
export type RecordedReceipt = {
  readonly id: string;
  readonly number: number | null;
  readonly kind: ReceiptKind;
  readonly documentDate: string | null;
  readonly supplierName: string | null;
  readonly title: string;
  readonly unitName: string;
  readonly quantity: DecimalString;
  readonly qtyBase: DecimalString;
  readonly costStatus: ReceiptCostStatus;
  readonly totalAmount: Money;
};

/** A receipt frozen with its operation id before it is sent, so a refresh or lost answer replays the same one. */
export type PendingReceipt = {
  readonly operationId: string;
  readonly receipt: QuickReceipt;
};
