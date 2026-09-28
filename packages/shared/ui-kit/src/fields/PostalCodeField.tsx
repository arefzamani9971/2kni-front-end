'use client';
import { DigitField, type DigitFieldProps } from './DigitField';

/** کد پستی — 10 digits. */
export function PostalCodeField({ label = 'کد پستی', placeholder = '۱۲۳۴۵۶۷۸۹۰', ...props }: DigitFieldProps) {
  return <DigitField label={label} placeholder={placeholder} autoComplete="postal-code" transform={(r) => r.replace(/[\s-]/g, '')} {...props} />;
}
