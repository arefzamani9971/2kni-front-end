import type { Dto } from '@dukani/contracts';
import {
  decimal,
  type DecimalString,
  formatDecimalFa,
  fromApiMoney,
  money,
  type Money,
  MONEY_MAX_DECIMALS,
  moneyOps,
  parseMoneyInput,
  toApiDecimal,
  toApiMoney,
} from '@dukani/domain';
import type { LineDraft } from './purchase.types';

/** «خلاصهٔ ورود» of Figma purchase (312:9194): conversion, line total and cost per base unit. */
export const lineSummary = (
  l: Pick<LineDraft, 'quantity' | 'baseQtyPerUnit' | 'unitName' | 'baseUnitName' | 'costStatus' | 'unitCost'>,
) => {
  const qtyBase = decimal.mul(l.quantity, l.baseQtyPerUnit);
  const conversion = decimal.eq(l.baseQtyPerUnit, decimal.of(1))
    ? `${formatDecimalFa(qtyBase)} ${l.baseUnitName}`
    : `${formatDecimalFa(l.quantity)} × ${formatDecimalFa(l.baseQtyPerUnit)} = ${formatDecimalFa(qtyBase)} ${l.baseUnitName}`;
  if (l.costStatus === 'Unknown' || !l.unitCost)
    return { conversion, total: null as Money | null, perBase: null as Money | null };
  const total = moneyOps.times(l.unitCost, l.quantity);
  const perBase = decimal.isZero(qtyBase)
    ? null
    : money(decimal.round(decimal.div(total.amount, qtyBase, 6), MONEY_MAX_DECIMALS));
  return { conversion, total, perBase };
};

export const toLineInput = (l: LineDraft): Dto<'PurchaseLineInput'> => ({
  storeProductId: l.storeProductId,
  storeProductUnitId: l.unitId,
  quantity: toApiDecimal(l.quantity),
  unitCostAmount: l.costStatus === 'Unknown' || !l.unitCost ? null : toApiMoney(l.unitCost),
  costStatus: l.costStatus,
  productionDate: l.productionDate,
  expiryDate: l.expiryDate,
  ...(l.zeroCostReason ? { zeroCostReason: l.zeroCostReason } : {}),
});

export const fromLineDto = (l: Dto<'PurchaseLineDto'>, baseUnitName = ''): LineDraft => ({
  storeProductId: l.storeProductId,
  title: l.title,
  baseUnitName,
  unitId: l.storeProductUnitId,
  unitName: l.unitName,
  baseQtyPerUnit: decimal.of(l.baseQtyPerUnit),
  quantity: decimal.of(l.quantity),
  costStatus: l.costStatus,
  unitCost: fromApiMoney(l.unitCostAmount),
  productionDate: l.productionDate ?? null,
  expiryDate: l.expiryDate ?? null,
  zeroCostReason: l.zeroCostReason ?? null,
});

/** Supplier invoice total vs computed total (Figma purchasetotals 358:547: «جمع محاسبه‌شده … اختلاف …»). */
export const invoiceDifference = (computedAmount: string | number, invoiceTotal: Money | null) => {
  if (!invoiceTotal) return null;
  const diff = moneyOps.sub(invoiceTotal, fromApiMoney(computedAmount)!);
  return { diff, matches: moneyOps.isZero(diff) };
};

/** Full PUT body from the current draft plus changes (the API replaces the draft, guarded by `version`). */
export const toUpdateBody = (
  p: Dto<'PurchaseDto'>,
  changes: Partial<Omit<Dto<'UpdatePurchaseDraftRequest'>, 'expectedVersion'>> = {},
): Dto<'UpdatePurchaseDraftRequest'> => ({
  supplierId: p.supplier?.id ?? null,
  supplierInvoiceNo: p.supplierInvoiceNo ?? null,
  purchasedAt: p.purchasedAt,
  discountAmount: p.discountAmount,
  shippingAmount: p.shippingAmount,
  nonRecoverableTaxAmount: p.nonRecoverableTaxAmount,
  note: p.note ?? null,
  lines: p.lines.map((l) => toLineInput(fromLineDto(l))),
  ...changes,
  expectedVersion: p.version,
});

/** DatePicker DateOnly → the API date-time (noon, so the Jalali day never shifts with time zones). */
export const dateOnlyToInstant = (d: string): string => new Date(`${d}T12:00:00`).toISOString();
export const instantToDateOnly = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Parsed amount as an API decimal string, or null when the input is invalid. */
export const toAmount = (raw: string): DecimalString | null => {
  const r = parseMoneyInput(raw || '0');
  return r.ok ? toApiMoney(r.value) : null;
};
export const initial = (v: string) => (decimal.isZero(decimal.of(v)) ? '' : v);
