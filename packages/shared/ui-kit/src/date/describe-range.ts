import type { useJalaliFormatting } from './use-jalali-formatting';
import type { UiTranslator } from '../i18n/types';
import type { DateRangeValue } from './describe-range.types';

export const describeRange = (
  v: DateRangeValue,
  t: UiTranslator,
  formatDate: ReturnType<typeof useJalaliFormatting>['date'],
): string =>
  v.preset !== 'Custom'
    ? t(`period.${v.preset}`)
    : v.range.from === v.range.to
      ? formatDate(v.range.from)
      : t('range.between', { from: formatDate(v.range.from), to: formatDate(v.range.to) });
