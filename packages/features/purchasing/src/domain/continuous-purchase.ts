import type { ContinuousDraft } from './continuous-purchase.types';
import type { RecordedReceipt } from './receipt.types';
import { emptyReceiptForm } from './receipt-form';

export const newContinuousDraft = (today: string, productId: string | null = null): ContinuousDraft => ({
  schemaVersion: 1,
  productId,
  form: emptyReceiptForm(today),
  pending: null,
  last: null,
});

/**
 * Identification only (CPB-18): the product and, when the scan named one, its unit. Nothing else changes — no
 * quantity, no receipt; a typed quantity or cost stays for the seller to confirm. Another product clears the unit
 * because units belong to their product.
 */
export const identifyProduct = (
  draft: ContinuousDraft,
  productId: string,
  unitId: string | null,
): ContinuousDraft => ({
  ...draft,
  productId,
  form: { ...draft.form, unitId: unitId ?? (productId === draft.productId ? draft.form.unitId : '') },
});

/**
 * After a confirmed receipt the same form is ready for the next, independent purchase: nothing of the previous
 * receipt is carried over (supplier, invoice, charges, costs), the date is today's again, and that receipt stays
 * viewable as `last`.
 */
export const afterRecorded = (recorded: RecordedReceipt, today: string): ContinuousDraft => ({
  ...newContinuousDraft(today),
  last: recorded,
});
