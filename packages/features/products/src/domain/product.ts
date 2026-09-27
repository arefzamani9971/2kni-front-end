import type { Dto } from '@dukani/contracts';
import { decimal, formatDecimalFa, formatJalali, formatMoney, fromApiMoney } from '@dukani/domain';

export type StockTone = 'neutral' | 'warning' | 'danger';

export type StockFilter = 'Any' | 'Low' | 'Out';
export type CostFilter = 'Any' | 'Unknown';
export type ProductFilter = { readonly q: string; readonly stock: StockFilter; readonly cost: CostFilter };

export const FILTER_LABELS = { Any: 'همه', Low: 'رو به اتمام', Out: 'تمام‌شده', Unknown: 'بهای نامعلوم' } as const;

const qty = (n: number) => formatDecimalFa(decimal.of(n));
const price = (rials: number | null | undefined) => (rials == null ? null : formatMoney(fromApiMoney(rials)!));

/** «۱۷ عدد · ۱۰٬۰۰۰ تومان» row of the list (Figma products 312:9504). */
export const productLine = (p: Dto<'StoreProductSummaryDto'>): string =>
  [`${qty(p.available)} ${p.baseUnitName}`, price(p.baseSalePriceRials) ?? 'بدون قیمت فروش'].join(' · ');

export const stockTone = (p: Dto<'StoreProductSummaryDto'>): StockTone => (p.available <= 0 ? 'danger' : p.isLowStock ? 'warning' : 'neutral');

export const stockNote = (p: Dto<'StoreProductSummaryDto'>): string | null =>
  p.available <= 0 ? 'تمام شده' : p.isLowStock ? 'رو به اتمام' : p.costStatus === 'Unknown' ? 'بهای نامعلوم' : null;

export const COST_LABELS: Record<Dto<'CostStatus'>, string> = { Known: 'معلوم', Estimated: 'تخمینی', Unknown: 'نامعلوم' };

/** Detail rows «موجودی و قیمت» (Figma detail 312:9534). */
export const detailRows = (p: Dto<'StoreProductDto'>): string[] => {
  const packs = p.units.filter((u) => u.baseQty !== 1);
  const rows = [`${qty(p.available)} ${p.baseUnitName} قابل‌فروش${p.reserved > 0 ? ` · ${qty(p.reserved)} رزرو` : ''}`];
  for (const u of packs) rows.push(`هر ${u.name} = ${qty(u.baseQty)} ${p.baseUnitName}`);
  const single = price(p.baseSalePriceRials);
  const packPrices = packs.map((u) => `${u.name} ${price(u.effectivePriceRials) ?? '—'}`);
  rows.push(single ? `فروش تکی ${single}${packPrices.length ? ` · ${packPrices.join(' · ')}` : ''}` : 'قیمت فروش تعیین نشده است');
  rows.push(`بهای میانگین: ${p.averageCostRials != null ? price(p.averageCostRials) : 'ثبت نشده'} (${COST_LABELS[p.costStatus]})`);
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
  // signed number isolated LTR (U+2066…U+2069) so «+۲۰ عدد» keeps its order inside RTL text
  quantity: `\u2066${m.qtyBase > 0 ? '+' : m.qtyBase < 0 ? '−' : ''}${qty(Math.abs(m.qtyBase))}\u2069 ${unit}`,
  direction: (m.qtyBase > 0 ? 'in' : m.qtyBase < 0 ? 'out' : 'neutral') as 'in' | 'out' | 'neutral',
  balance: `مانده: ${qty(m.balanceAfter)} ${unit}`,
});

export const parseFilter = (params: { q?: string | null; stock?: string | null; cost?: string | null }): ProductFilter => ({
  q: params.q ?? '',
  stock: params.stock === 'Low' || params.stock === 'Out' ? params.stock : 'Any',
  cost: params.cost === 'Unknown' ? 'Unknown' : 'Any',
});
