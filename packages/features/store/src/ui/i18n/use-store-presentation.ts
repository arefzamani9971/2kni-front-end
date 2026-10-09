import { useLocale } from '@dukani/i18n';
import { normalizeDigits, toPersianDigits } from '@dukani/domain';
import { isOvernight } from '../../domain/store-draft';
import type { StoreHoursPlan } from '../../domain/store-draft.types';
import { storeCatalogs } from './catalogs';
import { useStoreTranslations } from './use-store-translations';
export function useStorePresentation() {
  const t = useStoreTranslations();
  const locale = useLocale();
  const digits = (text: string) => (locale === 'fa' ? toPersianDigits(text) : normalizeDigits(text));
  const typeHint = (key: string) =>
    Object.hasOwn(storeCatalogs.fa.typeHints, key)
      ? t(`typeHints.${key as keyof typeof storeCatalogs.fa.typeHints}`)
      : undefined;
  const hours = (value: StoreHoursPlan) =>
    t('hoursSummary', {
      days: t(`dayPresets.${value.days}`),
      opens: digits(value.opens),
      closes: digits(value.closes),
      overnight: isOvernight(value) ? t('overnight') : '',
    });
  return { digits, typeHint, hours };
}
