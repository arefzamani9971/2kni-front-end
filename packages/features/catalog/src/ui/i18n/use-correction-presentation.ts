import { useFormatter } from '@dukani/i18n';
import { describeValue, isFixedCorrectionKey } from '../../domain/correction';
import type { CorrectionField } from '../../domain/correction.types';
import { useCatalogTexts } from './use-catalog-translations';

/** Labels and values of correction fields: fixed keys are translated here, attributes use their reference names. */
export function useCorrectionPresentation() {
  const t = useCatalogTexts();
  const formatter = useFormatter();
  const label = (key: string, field?: CorrectionField) =>
    isFixedCorrectionKey(key) ? t(`correction.keys.${key}`) : (field?.name ?? key.replace(/^attr:/, ''));
  const value = (field: CorrectionField | undefined, raw: string | null | undefined) => {
    if (field?.valueType === 'Bool' && raw) return raw === 'true' ? t('correction.yes') : t('correction.no');
    return describeValue(field, raw);
  };
  const date = (iso: string) =>
    formatter.dateTime(new Date(iso), {
      calendar: 'persian',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  return { label, value, date };
}
