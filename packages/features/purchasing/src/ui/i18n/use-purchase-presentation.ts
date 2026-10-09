import type { Dto } from '@dukani/contracts';
import { useLocale, useFormatter } from '@dukani/i18n';
import { decimal, formatDecimalFa, normalizeDigits, toPersianDigits, type Money } from '@dukani/domain';
import { usePurchaseTranslations } from './use-purchase-translations';
export function usePurchasePresentation() {
  const t = usePurchaseTranslations();
  const locale = useLocale();
  const formatter = useFormatter();
  const digits = (value: string) => (locale === 'fa' ? toPersianDigits(value) : normalizeDigits(value));
  const qty = (value: string | number) => {
    const formatted = formatDecimalFa(decimal.of(value));
    return locale === 'fa' ? formatted : normalizeDigits(formatted).replaceAll('٬', ',').replaceAll('٫', '.');
  };
  const toman = (amount: string | number | null | undefined) =>
    amount == null ? '—' : t('money', { amount: qty(amount) });
  const money = (value: Money) => toman(value.amount);
  const lineRow = (line: Dto<'PurchaseLineDto'>) =>
    qty(line.quantity) +
    ' ' +
    line.unitName +
    (!decimal.eq(decimal.of(line.baseQtyPerUnit), decimal.of(1)) ? ' (' + qty(line.qtyBase) + ')' : '') +
    ' · ' +
    (line.costStatus === 'Unknown' ? t('unknownCost') : toman(line.lineAmount));
  const summaryCard = (p: Dto<'PurchaseSummaryDto'>) => ({
    title:
      (p.status === 'Draft'
        ? t('draftTitle', {
            date: formatter.dateTime(new Date(p.purchasedAt), {
              calendar: 'persian',
              day: 'numeric',
              month: 'long',
            }),
          })
        : t('receiptShort', { number: p.number == null ? '' : qty(p.number) })) +
      (p.supplierName
        ? ' · ' + p.supplierName
        : p.kind === 'Opening' && p.status !== 'Draft'
          ? ' · ' + t('openingStock')
          : ''),
    meta:
      t('lineCount', { count: p.lineCount }) +
      (p.status === 'Draft'
        ? ''
        : ' · ' + toman(p.totalAmount) + (p.hasUnknownCost ? ' · ' + t('unknownCost') : '')),
    cta: t(`statuses.${p.status}`),
  });
  const costOptions = (['Known', 'Estimated', 'Unknown'] as const).map((value) => ({
    value,
    label: t(`costLabels.${value}`),
    description: t(`costDescriptions.${value}`),
  }));
  const listFilters = (['All', 'Draft', 'Finalized', 'Corrected'] as const).map((value) => ({
    value,
    label: t(`filters.${value}`),
  }));
  const date = (value: string) =>
    formatter.dateTime(new Date(value), {
      calendar: 'persian',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  return { digits, qty, toman, money, lineRow, summaryCard, costOptions, listFilters, date };
}
