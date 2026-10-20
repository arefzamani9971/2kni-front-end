import { decimal, type DecimalString, money, type Money, MONEY_MAX_DECIMALS, moneyOps } from '@dukani/domain';
import type { ReceiptCharges, ReceiptCostStatus } from './receipt.types';

const ZERO = money(0);
const or0 = (m: Money | null) => m ?? ZERO;

/** A known cost of zero, which needs its reason (F13 §5); an estimated or unknown cost never does. */
export const isKnownZero = (costStatus: ReceiptCostStatus, unitCost: Money | null) =>
  costStatus === 'Known' && !!unitCost && moneyOps.isZero(unitCost);

/** The line amount the charges are shared by; null when the cost is unknown. */
export const lineAmountOf = (
  costStatus: ReceiptCostStatus,
  unitCost: Money | null,
  quantity: DecimalString,
) => (costStatus === 'Unknown' || !unitCost ? null : moneyOps.times(unitCost, quantity));

/**
 * Shipping or a side charge with no known amount to share them by is refused by the server (CPB-15); the form says
 * so before sending instead of letting the cost vanish.
 */
export const chargesWithoutBasis = (lineAmount: Money | null, charges: ReceiptCharges) =>
  !moneyOps.isZero(moneyOps.add(or0(charges.shipping), or0(charges.sideCharge))) &&
  (!lineAmount || moneyOps.isZero(lineAmount));

/**
 * The preview of one receipt (BIZ-PUR-04 with a single line): total = amount − discount + shipping + side charge,
 * and the cost of one base unit after them. Unknown cost: no amounts at all, never zeros.
 */
export const receiptPreview = (
  lineAmount: Money | null,
  qtyBase: DecimalString,
  charges: ReceiptCharges,
): { readonly total: Money | null; readonly costPerBase: Money | null } => {
  if (!lineAmount) return { total: null, costPerBase: null };
  const extras = moneyOps.add(or0(charges.shipping), or0(charges.sideCharge));
  const total = moneyOps.add(moneyOps.sub(lineAmount, or0(charges.discount)), extras);
  const costPerBase = decimal.isZero(qtyBase)
    ? null
    : money(decimal.round(decimal.div(total.amount, qtyBase, 6), MONEY_MAX_DECIMALS));
  return { total, costPerBase };
};
