import type { Dto } from '@dukani/contracts';
import {
  decimal,
  type DecimalString,
  formatDecimalFa,
  formatJalali,
  formatMoney,
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
import { STATUS_LABELS } from './purchase.constants';

const fa = (n: number | string) => formatDecimalFa(decimal.of(n));
export const toman = (amount: string | number | null | undefined) =>
  amount == null ? '—' : formatMoney(fromApiMoney(amount)!);

/** List card of Figma purchaselist (358:546). */
export const summaryCard = (p: Dto<'PurchaseSummaryDto'>) => ({
  title:
    p.status === 'Draft'
      ? `پیش‌نویس ${formatJalali(new Date(p.purchasedAt), 'd MMMM')}${p.supplierName ? ` · ${p.supplierName}` : ''}`
      : `رسید ${p.number != null ? fa(p.number) : ''}${p.supplierName ? ` · ${p.supplierName}` : p.kind === 'Opening' ? ' · موجودی اول دوره' : ''}`,
  meta:
    p.status === 'Draft'
      ? `${fa(p.lineCount)} قلم`
      : `${fa(p.lineCount)} قلم · ${toman(p.totalAmount)}${p.hasUnknownCost ? ' · بهای نامعلوم' : ''}`,
  cta: STATUS_LABELS[p.status],
});

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
});

/** Supplier invoice total vs computed total (Figma purchasetotals 358:547: «جمع محاسبه‌شده … اختلاف …»). */
export const invoiceDifference = (computedAmount: string | number, invoiceTotal: Money | null) => {
  if (!invoiceTotal) return null;
  const diff = moneyOps.sub(invoiceTotal, fromApiMoney(computedAmount)!);
  return { diff, matches: moneyOps.isZero(diff) };
};

export const lineRow = (l: Dto<'PurchaseLineDto'>) =>
  `${fa(l.quantity)} ${l.unitName}${!decimal.eq(decimal.of(l.baseQtyPerUnit), decimal.of(1)) ? ` (${fa(l.qtyBase)})` : ''} · ${l.costStatus === 'Unknown' ? 'بهای نامعلوم' : toman(l.lineAmount)}`;

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
