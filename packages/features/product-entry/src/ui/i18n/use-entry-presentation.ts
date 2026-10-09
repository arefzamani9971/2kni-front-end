import { useLocale, formatDecimalString } from '@dukani/i18n';
import { decimal, normalizeDigits, toPersianDigits, type Money } from '@dukani/domain';
import { useEntryTranslations } from './use-entry-translations';
export function useEntryPresentation() {
  const locale = useLocale();
  const t = useEntryTranslations();
  return {
    qty: (value: string | number) => formatDecimalString(decimal.of(value), locale),
    digits: (value: string) => (locale === 'fa' ? toPersianDigits(value) : normalizeDigits(value)),
    money: (value: Money, options: { unit?: boolean } = {}) =>
      options.unit === false
        ? formatDecimalString(value.amount, locale)
        : t('money', { amount: formatDecimalString(value.amount, locale) }),
  };
}
