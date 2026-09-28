'use client';
import { MONEY_UNIT_LABEL } from '@dukani/domain';
import { DecimalField, type DecimalInputProps } from './DecimalField';

/** Money (Decimal, single unit; no Rial/Toman conversion). Thousands are grouped while typing. */
export function MoneyField({ unit = MONEY_UNIT_LABEL, maxDecimals = 0, ...props }: Omit<DecimalInputProps, 'grouping'>) {
  return <DecimalField grouping unit={unit} maxDecimals={maxDecimals} {...props} />;
}
