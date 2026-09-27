import type { Dto } from '@dukani/contracts';
import { decimal, formatDecimalFa, formatJalali, formatMoney, fromApiMoney, money, moneyOps, type DecimalString, type Money } from '@dukani/domain';

export type PurchaseStatus = Dto<'PurchaseStatus'>;
export type ListFilter = 'All' | 'Draft' | 'Finalized' | 'Corrected';

export const LIST_FILTERS: { value: ListFilter; label: string }[] = [
  { value: 'All', label: 'همه' },
  { value: 'Draft', label: 'پیش‌نویس' },
  { value: 'Finalized', label: 'نهایی' },
  { value: 'Corrected', label: 'اصلاح‌شده' },
];

export const STATUS_LABELS: Record<PurchaseStatus, string> = {
  Draft: 'ادامه ثبت',
  Finalized: 'نهایی',
  Cancelled: 'ابطال‌شده',
  Discarded: 'دورریخته',
};

export const COST_STATUS_OPTIONS: { value: Dto<'CostStatus'>; label: string; description: string }[] = [
  { value: 'Known', label: 'معلوم', description: 'بر اساس فاکتور خرید' },
  { value: 'Estimated', label: 'تخمینی', description: 'بعداً قابل اصلاح است' },
  { value: 'Unknown', label: 'نامعلوم', description: 'بها را بعداً تکمیل می‌کنم' },
];

const fa = (n: number | string) => formatDecimalFa(decimal.of(n));
export const toman = (rials: number | null | undefined) => (rials == null ? '—' : formatMoney(fromApiMoney(rials)!));

/** List card of Figma purchaselist (358:546). */
export const summaryCard = (p: Dto<'PurchaseSummaryDto'>) => ({
  title:
    p.status === 'Draft'
      ? `پیش‌نویس ${formatJalali(new Date(p.purchasedAt), 'd MMMM')}${p.supplierName ? ` · ${p.supplierName}` : ''}`
      : `رسید ${p.number != null ? fa(p.number) : ''}${p.supplierName ? ` · ${p.supplierName}` : p.kind === 'Opening' ? ' · موجودی اول دوره' : ''}`,
  meta: p.status === 'Draft' ? `${fa(p.lineCount)} قلم` : `${fa(p.lineCount)} قلم · ${toman(p.totalRials)}${p.hasUnknownCost ? ' · بهای نامعلوم' : ''}`,
  cta: STATUS_LABELS[p.status],
});

/** A line being edited in the receipt (quantities/money as canonical decimals). */
export type LineDraft = {
  readonly storeProductId: string;
  readonly title: string;
  readonly baseUnitName: string;
  readonly unitId: string;
  readonly unitName: string;
  readonly baseQtyPerUnit: DecimalString;
  readonly quantity: DecimalString;
  readonly costStatus: Dto<'CostStatus'>;
  readonly unitCost: Money | null;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
};

/** «خلاصهٔ ورود» of Figma purchase (312:9194): conversion, line total and cost per base unit. */
export const lineSummary = (l: Pick<LineDraft, 'quantity' | 'baseQtyPerUnit' | 'unitName' | 'baseUnitName' | 'costStatus' | 'unitCost'>) => {
  const qtyBase = decimal.mul(l.quantity, l.baseQtyPerUnit);
  const conversion = decimal.eq(l.baseQtyPerUnit, decimal.of(1))
    ? `${formatDecimalFa(qtyBase)} ${l.baseUnitName}`
    : `${formatDecimalFa(l.quantity)} × ${formatDecimalFa(l.baseQtyPerUnit)} = ${formatDecimalFa(qtyBase)} ${l.baseUnitName}`;
  if (l.costStatus === 'Unknown' || !l.unitCost) return { conversion, total: null as Money | null, perBase: null as Money | null };
  const total = moneyOps.times(l.unitCost, l.quantity);
  const perBase = decimal.isZero(qtyBase) ? null : money(decimal.round(decimal.div(total.amount, qtyBase, 6), 0));
  return { conversion, total, perBase };
};

export const toLineInput = (l: LineDraft): Dto<'PurchaseLineInput'> => ({
  storeProductId: l.storeProductId,
  storeProductUnitId: l.unitId,
  quantity: Number(l.quantity),
  unitCostRials: l.costStatus === 'Unknown' || !l.unitCost ? null : Number(l.unitCost.amount),
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
  unitCost: fromApiMoney(l.unitCostRials),
  productionDate: l.productionDate ?? null,
  expiryDate: l.expiryDate ?? null,
});

/** Supplier invoice total vs computed total (Figma purchasetotals 358:547: «جمع محاسبه‌شده … اختلاف …»). */
export const invoiceDifference = (computedRials: number, invoiceTotal: Money | null) => {
  if (!invoiceTotal) return null;
  const diff = moneyOps.sub(invoiceTotal, fromApiMoney(computedRials)!);
  return { diff, matches: moneyOps.isZero(diff) };
};

export const lineRow = (l: Dto<'PurchaseLineDto'>) =>
  `${fa(l.quantity)} ${l.unitName}${l.baseQtyPerUnit !== 1 ? ` (${fa(l.qtyBase)})` : ''} · ${l.costStatus === 'Unknown' ? 'بهای نامعلوم' : toman(l.lineAmountRials)}`;

/** Full PUT body from the current draft plus changes (the API replaces the draft, guarded by `version`). */
export const toUpdateBody = (
  p: Dto<'PurchaseDto'>,
  changes: Partial<Omit<Dto<'UpdatePurchaseDraftRequest'>, 'expectedVersion'>> = {},
): Dto<'UpdatePurchaseDraftRequest'> => ({
  supplierId: p.supplier?.id ?? null,
  supplierInvoiceNo: p.supplierInvoiceNo ?? null,
  purchasedAt: p.purchasedAt,
  discountRials: p.discountRials,
  shippingRials: p.shippingRials,
  nonRecoverableTaxRials: p.nonRecoverableTaxRials,
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
