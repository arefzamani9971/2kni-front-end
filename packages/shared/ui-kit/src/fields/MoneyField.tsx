'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { DecimalField } from './DecimalField';
import type { DecimalInputProps } from './DecimalField.types';

/** Money (Decimal, single unit; no Rial/Toman conversion). Thousands are grouped while typing. */
export function MoneyField({ unit, maxDecimals = 0, ...props }: Omit<DecimalInputProps, 'grouping'>) {
  const t = useUiTranslations();
  return <DecimalField grouping unit={unit ?? t('money.unit')} maxDecimals={maxDecimals} {...props} />;
}
