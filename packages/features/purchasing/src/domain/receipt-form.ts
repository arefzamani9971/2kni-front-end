import { decimal } from '@dukani/domain';
import { isKnownZero } from './receipt';
import type { QuickReceipt, ReceiptKind } from './receipt.types';
import type { ReceiptFormOutput, ReceiptFormValues } from './receipt-form.types';

/**
 * An empty receipt form. A purchase starts on today's business date; an Opening starts without a date (unknown).
 * Only the product's own unit choice is carried in by the caller, never an earlier receipt's values.
 */
export const emptyReceiptForm = (documentDate: string, unitId = ''): ReceiptFormValues => ({
  unitId,
  quantity: '',
  costStatus: 'Known',
  unitCost: '',
  zeroCostReason: '',
  productionDate: '',
  expiryDate: '',
  documentDate,
  supplierId: '',
  invoiceNo: '',
  discount: '',
  shipping: '',
  sideCharge: '',
  salePrice: '',
});

/**
 * The receipt a validated form sends. An Opening is not a purchase: no supplier, invoice or charges are sent, and
 * its date stays unknown (null) unless one was given (F13 §3, CPB-04).
 */
export const toQuickReceipt = (
  kind: ReceiptKind,
  productId: string,
  v: ReceiptFormOutput,
  duplicateInvoiceReason: string | null = null,
): QuickReceipt => {
  const purchase = kind === 'Purchase';
  return {
    kind,
    line: {
      productId,
      unitId: v.unitId,
      quantity: v.quantity,
      costStatus: v.costStatus,
      unitCost: v.costStatus === 'Unknown' ? null : v.unitCost,
      zeroCostReason: isKnownZero(v.costStatus, v.unitCost) ? v.zeroCostReason : null,
      productionDate: v.productionDate,
      expiryDate: v.expiryDate,
    },
    supplierId: purchase ? v.supplierId : null,
    invoiceNo: purchase ? v.invoiceNo : null,
    documentDate: v.documentDate,
    duplicateInvoiceReason: purchase ? duplicateInvoiceReason : null,
    charges: purchase
      ? { discount: v.discount, shipping: v.shipping, sideCharge: v.sideCharge }
      : { discount: null, shipping: null, sideCharge: null },
  };
};

/**
 * The entry unit a receipt form starts with (F12 §6, AC07): a held or scanned unit while it can still be bought;
 * one that cannot is cleared for a new choice (`stale`) and never replaced silently by another unit. With nothing
 * held, the first pack (the usual purchase unit), else the base unit.
 */
export const initialReceiptUnit = (
  held: string,
  purchasable: readonly { readonly id: string; readonly baseQty: string }[],
): { readonly unitId: string; readonly stale: boolean } => {
  if (held)
    return purchasable.some((u) => u.id === held)
      ? { unitId: held, stale: false }
      : { unitId: '', stale: true };
  const pack = purchasable.find((u) => !decimal.eq(decimal.of(u.baseQty), decimal.of(1)));
  return { unitId: (pack ?? purchasable[0])?.id ?? '', stale: false };
};
