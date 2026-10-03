'use client';
import { DigitField } from './DigitField';
import type { DigitFieldProps } from './DigitField.types';

/** Unsigned integer (Kind=Integer). Decimal quantities use DecimalField. */
export function IntegerField(props: DigitFieldProps) {
  return <DigitField {...props} />;
}
