'use client';
import { DigitField, type DigitFieldProps } from './DigitField';

/** Unsigned integer (Kind=Integer). Decimal quantities use DecimalField. */
export function IntegerField(props: DigitFieldProps) {
  return <DigitField {...props} />;
}
