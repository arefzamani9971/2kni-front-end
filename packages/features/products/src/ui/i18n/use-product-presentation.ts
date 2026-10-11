import type { Dto } from '@dukani/contracts';
import { useFormatter, useLocale } from '@dukani/i18n';
import { decimal, formatDecimalFa, normalizeDigits } from '@dukani/domain';
import { useProductTranslations } from './use-product-translations';
export function useProductPresentation() {
  const t = useProductTranslations();
  const locale = useLocale();
  const formatter = useFormatter();
  const dec = (value: string | number) => decimal.of(value);
  const qty = (value: string | number) => {
    const text = formatDecimalFa(dec(value));
    return locale === 'fa' ? text : normalizeDigits(text).replaceAll('٬', ',').replaceAll('٫', '.');
  };
  const price = (value: string | number | null | undefined) =>
    value == null ? null : t('money', { amount: qty(value) });
  const isOut = (value: string | number) => !decimal.isPositive(dec(value));
  const productLine = (p: Dto<'StoreProductSummaryDto'>) =>
    [
      p.kind === 'Service' ? p.baseUnitName : qty(p.available) + ' ' + p.baseUnitName,
      price(p.baseSalePriceAmount) ?? t('noPrice'),
    ].join(' · ');
  const stockNote = (p: Dto<'StoreProductSummaryDto'>) =>
    p.kind === 'Service'
      ? null
      : isOut(p.available)
        ? t('out')
        : p.isLowStock
          ? t('low')
          : p.costStatus === 'Unknown'
            ? t('filters.Unknown')
            : null;
  const detailRows = (p: Dto<'StoreProductDto'>) => {
    const packs = p.units.filter((u) => !decimal.eq(dec(u.baseQty), decimal.of(1)));
    const rows =
      p.kind === 'Service'
        ? []
        : [
            t('available', { quantity: qty(p.available), unit: p.baseUnitName }) +
              (decimal.isPositive(dec(p.reserved))
                ? ' · ' + t('reserved', { quantity: qty(p.reserved) })
                : ''),
          ];
    for (const unit of packs)
      rows.push(t('pack', { name: unit.name, quantity: qty(unit.baseQty), unit: p.baseUnitName }));
    const single = price(p.baseSalePriceAmount);
    const packPrices = packs.map((u) => u.name + ' ' + (price(u.effectivePriceAmount) ?? '—'));
    rows.push(single ? [t('singlePrice', { price: single }), ...packPrices].join(' · ') : t('priceUnset'));
    rows.push(
      t('averageCost', {
        price: price(p.averageCostAmount) ?? t('notRecorded'),
        status: t(`cost.${p.costStatus}`),
      }),
    );
    if (p.lowStockThreshold != null)
      rows.push(t('lowStock', { quantity: qty(p.lowStockThreshold), unit: p.baseUnitName }));
    return rows;
  };
  const movementView = (m: Dto<'StockMovementDto'>, unit: string) => ({
    title: t(`movements.${m.type}`),
    reference: m.refNumber ? t('receipt', { number: qty(m.refNumber) }) : (m.note ?? undefined),
    date: formatter.dateTime(new Date(m.occurredAt), {
      calendar: 'persian',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    quantity:
      '\u2066' +
      (decimal.isPositive(dec(m.qtyBase)) ? '+' : decimal.isNegative(dec(m.qtyBase)) ? '−' : '') +
      qty(decimal.abs(dec(m.qtyBase))) +
      '\u2069',
    unit,
    direction: (decimal.isPositive(dec(m.qtyBase))
      ? 'in'
      : decimal.isNegative(dec(m.qtyBase))
        ? 'out'
        : 'neutral') as 'in' | 'out' | 'neutral',
    balance: t('balance', { quantity: qty(m.balanceAfter), unit }),
  });
  return { price, productLine, stockNote, detailRows, movementView };
}
