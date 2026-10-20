import type { DecimalString, Money } from '@dukani/domain';
import type { ReceiptCostStatus } from './receipt.types';

/**
 * The single-product receipt form as typed (raw strings, so a draft restores exactly what the seller saw). Shared by
 * the continuous purchase (CPB-06) and each opening-queue item (CPB-04); fields an Opening does not use stay empty.
 */
export type ReceiptFormValues = {
  readonly unitId: string;
  readonly quantity: string;
  readonly costStatus: ReceiptCostStatus;
  readonly unitCost: string;
  readonly zeroCostReason: string;
  readonly productionDate: string;
  readonly expiryDate: string;
  /** Purchase only; an Opening's date stays unknown unless the seller gives one. */
  readonly documentDate: string;
  readonly supplierId: string;
  readonly invoiceNo: string;
  readonly discount: string;
  readonly shipping: string;
  readonly sideCharge: string;
  /** Optional explicit new base sale price, sent as its own command after the receipt (BIZ-PUR-08). */
  readonly salePrice: string;
};

/** The form after validation and parsing (schema output): decimals and money, empty optional fields as null. */
export type ReceiptFormOutput = {
  readonly unitId: string;
  readonly quantity: DecimalString;
  readonly costStatus: ReceiptCostStatus;
  readonly unitCost: Money | null;
  readonly zeroCostReason: string | null;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
  readonly documentDate: string | null;
  readonly supplierId: string | null;
  readonly invoiceNo: string | null;
  readonly discount: Money | null;
  readonly shipping: Money | null;
  readonly sideCharge: Money | null;
  readonly salePrice: Money | null;
};
