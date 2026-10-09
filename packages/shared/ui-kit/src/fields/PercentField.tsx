'use client';
import { useLocale } from '@dukani/i18n';
import { DecimalField } from './DecimalField';
import type { DecimalInputProps } from './DecimalField.types';

export function PercentField({ maxDecimals = 2, ...props }: DecimalInputProps) {
  const locale = useLocale();
  const percent = new Intl.NumberFormat(locale, { style: 'percent' })
    .formatToParts(1)
    .find((part) => part.type === 'percentSign')?.value;
  return <DecimalField maxDecimals={maxDecimals} unit={percent} {...props} />;
}
