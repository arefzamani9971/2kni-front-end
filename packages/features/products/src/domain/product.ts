import type { Dto } from '@dukani/contracts';
import { decimal, formatDecimalFa, formatJalali, formatMoney, fromApiMoney } from '@dukani/domain';

export type StockTone = 'neutral' | 'warning' | 'danger';

export type StockFilter = 'Any' | 'Low' | 'Out';
export type CostFilter = 'Any' | 'Unknown';
export type ProductFilter = { readonly q: string; readonly stock: StockFilter; readonly cost: CostFilter };

export const FILTER_LABELS = { Any: 'همه', Low: 'رو به اتمام', Out: 'تمام‌شده', Unknown: 'بهای نامعلوم' } as const;

/** API decimals (money and quantities) arrive as strings (BCR-01). */
const dec = (v: string | number) => decimal.of(v);
const qty = (n: string | number) => formatDecimalFa(dec(n));
const price = (amount: string | number | null | undefined) => (amount == null ? null : formatMoney(fromApiMoney(amount)!));
const isOut = (available: string | number) => !decimal.isPositive(dec(available));

/** «۱۷ عدد · ۱۰٬۰۰۰ تومان» row of the list (Figma products 312:9504). */
export const productLine = (p: Dto<'StoreProductSummaryDto'>): string =>
  [`${qty(p.available)} ${p.baseUnitName}`, price(p.baseSalePriceAmount) ?? 'بدون قیمت فروش'].join(' · ');

export const stockTone = (p: Dto<'StoreProductSummaryDto'>): StockTone => (isOut(p.available) ? 'danger' : p.isLowStock ? 'warning' : 'neutral');

export const stockNote = (p: Dto<'StoreProductSummaryDto'>): string | null =>
  isOut(p.available) ? 'تمام شده' : p.isLowStock ? 'رو به اتمام' : p.costStatus === 'Unknown' ? 'بهای نامعلوم' : null;

export const COST_LABELS: Record<Dto<'CostStatus'>, string> = { Known: 'معلوم', Estimated: 'تخمینی', Unknown: 'نامعلوم' };

/** Detail rows «موجودی و قیمت» (Figma detail 312:9534). */
export const detailRows = (p: Dto<'StoreProductDto'>): string[] => {
  const packs = p.units.filter((u) => !decimal.eq(dec(u.baseQty), decimal.of(1)));
  const rows = [`${qty(p.available)} ${p.baseUnitName} قابل‌فروش${decimal.isPositive(dec(p.reserved)) ? ` · ${qty(p.reserved)} رزرو` : ''}`];
  for (const u of packs) rows.push(`هر ${u.name} = ${qty(u.baseQty)} ${p.baseUnitName}`);
  const single = price(p.baseSalePriceAmount);
  const packPrices = packs.map((u) => `${u.name} ${price(u.effectivePriceAmount) ?? '—'}`);
  rows.push(single ? `فروش تکی ${single}${packPrices.length ? ` · ${packPrices.join(' · ')}` : ''}` : 'قیمت فروش تعیین نشده است');
  rows.push(`بهای میانگین: ${p.averageCostAmount != null ? price(p.averageCostAmount) : 'ثبت نشده'} (${COST_LABELS[p.costStatus]})`);
  if (p.lowStockThreshold != null) rows.push(`هشدار کمبود زیر ${qty(p.lowStockThreshold)} ${p.baseUnitName}`);
  return rows;
};

const MOVEMENT_LABELS: Record<Dto<'MovementType'>, string> = {
  Opening: 'موجودی اول دوره',
  Purchase: 'خرید',
  Sale: 'فروش',
  Adjustment: 'اصلاح موجودی',
  Count: 'شمارش انبار',
  PurchaseCorrection: 'اصلاح خرید',
  SaleCorrection: 'اصلاح فروش',
  Reversal: 'برگشت',
};

export const movementView = (m: Dto<'StockMovementDto'>, unit: string) => ({
  title: MOVEMENT_LABELS[m.type],
  reference: m.refNumber ? `رسید شماره ${formatDecimalFa(decimal.of(m.refNumber))}` : (m.note ?? undefined),
  date: formatJalali(new Date(m.occurredAt), 'd MMMM yyyy'),
  // signed number isolated LTR (U+2066…U+2069) so «+۲۰» keeps its sign on the left inside RTL text
  quantity: `\u2066${decimal.isPositive(dec(m.qtyBase)) ? '+' : decimal.isNegative(dec(m.qtyBase)) ? '−' : ''}${qty(decimal.abs(dec(m.qtyBase)))}\u2069`,
  unit,
  direction: (decimal.isPositive(dec(m.qtyBase)) ? 'in' : decimal.isNegative(dec(m.qtyBase)) ? 'out' : 'neutral') as 'in' | 'out' | 'neutral',
  balance: `مانده: ${qty(m.balanceAfter)} ${unit}`,
});

export const parseFilter = (params: { q?: string | null; stock?: string | null; cost?: string | null }): ProductFilter => ({
  q: params.q ?? '',
  stock: params.stock === 'Low' || params.stock === 'Out' ? params.stock : 'Any',
  cost: params.cost === 'Unknown' ? 'Unknown' : 'Any',
});
