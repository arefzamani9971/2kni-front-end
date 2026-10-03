'use client';
import { DecimalField } from './DecimalField';
import type { DecimalInputProps } from './DecimalField.types';

/** Quantity in a unit; `maxDecimals` comes from the unit (0 for count items, e.g. 3 for kilogram). */
export function QuantityField(props: DecimalInputProps) {
  return <DecimalField {...props} />;
}
